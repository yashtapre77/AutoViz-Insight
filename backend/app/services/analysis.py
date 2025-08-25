from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd

class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def clean_data(self, *, file_path:str):