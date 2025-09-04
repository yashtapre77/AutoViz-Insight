# app/api/v1/endpoints/analysis.py
from fastapi import APIRouter, Depends, UploadFile, Form, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
from app.db.session import get_db
from app.utils.file import save_file
from app.services.user import UserServices
from app.schemas.anlysis import AnalysisRequirements, AnalysisRequirementIn, AnalysisTransactionOut
from app.models.user import User
from app.models.analysis import Analysis_Requirement, Analysis_Result
from app.services.analysis import AnalysisService
from app.services.transaction import TransactionService

router = APIRouter(prefix="/analysis", tags=["analysis"])


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/analyze", response_model=AnalysisTransactionOut, status_code=201)
async def return_analysis_dashboard(
    token: str = Depends(oauth2_scheme),
    requirements: str = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    print("Received analysis request")
    user_services = UserServices(db)
    current_user = await user_services.get_current_user(token)
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Save file
    try:
        file_path = save_file(file, str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File error: {str(e)}")

    print("File saved at:", file_path)
    # Store in DB
    transaction_service = TransactionService(db)
    transaction = await transaction_service.create_transaction(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        user_query=requirements,
    )

    """
    Upload dataset + requirements.
    Performs basic EDA and stores transaction.
    """

    print("Transaction created with ID:", transaction.id)
    # try:
    analysis_service = AnalysisService(db)
    analysis_result = await analysis_service.perform_analysis(requirement_id=transaction.id)
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

    await db.refresh(analysis_result)
    await db.refresh(transaction)
    return AnalysisTransactionOut(
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        dataset_name=transaction.file_name,
        requirements=transaction.user_query,
        dashboard_code=analysis_result.dashboard_code
    )



@router.get("/dataset/{requirement_id}", status_code=200)
async def get_dataset_preview(
    requirement_id: int,
    # token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    # user_services = UserServices(db)
    # current_user = await user_services.get_current_user(token)
    # if not current_user:
    #     raise HTTPException(status_code=401, detail="Unauthorized")

    transaction_service = TransactionService(db)
    transaction = await transaction_service.get_transaction(requirement_id)
    # if not transaction or transaction.user_id != current_user.id:
    #     raise HTTPException(status_code=404, detail="Transaction not found")


    try:
        df = pd.read_csv(transaction.file_path)
        preview = df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File read error: {str(e)}")

    return preview