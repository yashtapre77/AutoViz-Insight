from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd

class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def perform_analysis(self, *, requirement_id: str = None):
        pass

    def get_tableau_file(self, *, file_path:str):
        pass