# app/api/v1/endpoints/analysis.py
from fastapi import APIRouter, Depends, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
from app.db.session import get_db
from app.services.file import save_file
from app.services.user import UserServices
from app.schemas.anlysis import AnalysisRequirements, AnalysisRequirementIn, AnalysisTransactionOut
from app.models.user import User
from app.models.analysis import Analysis_Requirement, Analysis_Result

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/anlyze", response_model=AnalysisTransactionOut)
async def upload_dataset(
    requirements: str = Form(...),
    file: UploadFile = None,
    db: AsyncSession = Depends(get_db)
):
    user_services = Depends(UserServices(db)),
    current_user = Depends(user_services.get_current_user()),
    # Save file
    file_path = save_file(file, str(current_user.id))
    
    # Store in DB
    transaction = Analysis_Requirement(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=file_path,
        user_query=requirements,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)


    """
    Upload dataset + requirements.
    Performs basic EDA and stores transaction.
    """


    

    return transaction
