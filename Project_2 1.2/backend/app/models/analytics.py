
from sqlalchemy import Column, Integer, Float, DateTime
from sqlalchemy.dialects.postgresql import NUMERIC as Numeric
from sqlalchemy.sql import func
from app.db.session import Base

class AnalyticsPercentages(Base):
    __tablename__ = "analytics_percentages"
    
    id = Column(Integer, primary_key=True, index=True)
    placed_percentage = Column(Numeric(5, 2), nullable=False)
    unplaced_percentage = Column(Numeric(5, 2), nullable=False)
    higher_studies_percentage = Column(Numeric(5, 2), nullable=False)
    exploring_percentage = Column(Numeric(5, 2), nullable=False)
    others_percentage = Column(Numeric(5, 2), nullable=False)
    placement_rate_percentage = Column(Numeric(5, 2), nullable=False)
    total_students = Column(Integer, nullable=False)
    placed_students = Column(Integer, nullable=False)
    unplaced_students = Column(Integer, nullable=False)
    higher_studies_count = Column(Integer, nullable=False)
    exploring_count = Column(Integer, nullable=False)
    others_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
