from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analysis import Analysis_Requirement, Analysis_Result
from sqlalchemy import select

class TransactionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(self, *, user_id: int, file_name: str, file_path: str, user_query: str) -> Analysis_Requirement:
        transaction = Analysis_Requirement(
            user_id=user_id,
            file_name=file_name,
            file_path=file_path,
            user_query=user_query,
        )
        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)
        return transaction
    
    async def get_transaction(self, transaction_id: int) -> Analysis_Requirement:
        result = (await self.db.execute(select(Analysis_Requirement).where(Analysis_Requirement.id == transaction_id))).scalars().first()
        return result
    
    async def create_analysis_result(self, *, transaction_id: int, graph_suggestions: dict, dashboard_code: str):
        user_id = (await self.get_transaction(transaction_id)).user_id
        analysis_result = Analysis_Result(
            requirement_id=transaction_id,
            user_id=user_id,
            graph_suggestions=graph_suggestions,
            dashboard_code=dashboard_code
        )
        self.db.add(analysis_result)
        await self.db.commit()  
        await self.db.refresh(analysis_result)
        return analysis_result
        