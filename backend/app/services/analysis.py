from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
    