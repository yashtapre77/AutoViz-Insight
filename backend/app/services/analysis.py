from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.data_cleaning import clean_pipeline
from app.services.transaction import TransactionService
import pandas as pd

class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_service = TransactionService(db)
    
    def perform_analysis(self, *, requirement_id: str = None):
        transaction = self.transaction_service.get_transaction(requirement_id)
        file_path = transaction.file_path
        cleaned_df = clean_pipeline(file_path)

        

    def get_tableau_file(self, *, file_path:str):
        pass