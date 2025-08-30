from pydantic import BaseModel, FilePath, Field
from typing import Optional, List, Annotated
from datetime import datetime

class AnalysisRequirements(BaseModel):
    file_name: str
    file_path: FilePath
    user_query: Optional[Annotated[str, Field(..., min_length=1, max_length=500)]]

class AnalysisRequirementIn(BaseModel):
    file: bytes = Field(..., description="The file to be uploaded")
    user_query: str

class AnalysisTransactionOut(BaseModel):
    user_id: int
    dataset_name: str
    requirements: str
    dashboard_code: str

    class Config:
        orm_mode = True