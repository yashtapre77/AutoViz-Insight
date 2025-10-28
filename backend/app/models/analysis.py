import uuid
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.session import Base  # assuming you already have Base from SQLAlchemy setup

class Analysis_Requirement(Base):
    __tablename__ = "Analysis_Requirement"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False) 
    user_query = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # relationships
    user = relationship("User", back_populates="analysis_requirements")
    analysis_results = relationship("Analysis_Result", back_populates="requirement", cascade="all, delete-orphan")
    analysis_dashboards = relationship("Analysis_Dashboard", back_populates="requirement", cascade="all, delete-orphan")


class Analysis_Result(Base):
    __tablename__ = "Analysis_Result"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("Analysis_Requirement.id", ondelete="CASCADE"), nullable=False)

    
    graph_suggestions = Column(JSON, nullable=True)   # will hold list of graphs suggested by LLM
    dashboard_code = Column(String, nullable=True)  # will hold the generated dashboard code
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # relationships
    user = relationship("User", back_populates="analysis_results")
    requirement = relationship("Analysis_Requirement", back_populates="analysis_results")


class Analysis_Dashboard(Base):
    __tablename__ = "Analysis_Dashboard"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("Analysis_Requirement.id", ondelete="CASCADE"), nullable=False)

    dashboard_code = Column(String, nullable=True)  # will hold the generated dashboard code
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # relationships
    user = relationship("User", back_populates="analysis_dashboards")
    requirement = relationship("Analysis_Requirement", back_populates="analysis_dashboards")
