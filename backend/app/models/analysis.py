import uuid
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.session import Base  # assuming you already have Base from SQLAlchemy setup

class Analysis_Requirement(Base):
    __tablename__ = "Analysis_Requirement"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False) 
    user_query = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    user = relationship("User", back_populates="Analysis_Requirement")
    transactions = relationship("Analysis_Result", back_populates="Analysis_Requirement", cascade="all, delete-orphan")


class Analysis_Result(Base):
    __tablename__ = "Analysis_Result"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(String, ForeignKey("Analysis_Requirement.id", ondelete="CASCADE"), nullable=False)

    
    anlysis_report = Column(JSON, nullable=False)
    graph_suggestions = Column(JSON, nullable=True)   # will hold list of graphs suggested by LLM
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    user = relationship("User", back_populates="Analysis_Result")
    dataset = relationship("Dataset", back_populates="Analysis_Result")
