from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AnalyticsPercentagesBase(BaseModel):
    placed_percentage: Decimal
    unplaced_percentage: Decimal
    higher_studies_percentage: Decimal
    exploring_percentage: Decimal
    others_percentage: Decimal
    placement_rate_percentage: Decimal
    total_students: int
    placed_students: int
    unplaced_students: int
    higher_studies_count: int
    exploring_count: int
    others_count: int

class AnalyticsPercentagesCreate(AnalyticsPercentagesBase):
    pass

class AnalyticsPercentagesUpdate(BaseModel):
    placed_percentage: Optional[Decimal] = None
    unplaced_percentage: Optional[Decimal] = None
    higher_studies_percentage: Optional[Decimal] = None
    exploring_percentage: Optional[Decimal] = None
    others_percentage: Optional[Decimal] = None
    placement_rate_percentage: Optional[Decimal] = None
    total_students: Optional[int] = None
    placed_students: Optional[int] = None
    unplaced_students: Optional[int] = None
    higher_studies_count: Optional[int] = None
    exploring_count: Optional[int] = None
    others_count: Optional[int] = None

class AnalyticsPercentagesResponse(AnalyticsPercentagesBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True