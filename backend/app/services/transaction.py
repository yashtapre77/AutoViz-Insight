from sqlalchemy.ext.asyncio import AsyncSession
from app.models.analysis import Analysis_Requirement

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