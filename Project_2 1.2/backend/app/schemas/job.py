from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    description: str
    requirements: str
    salary_range: Optional[str] = None

class JobCreate(JobBase):
    application_deadline: Optional[datetime] = None
    created_by: int

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_range: Optional[str] = None
    application_deadline: Optional[datetime] = None
    is_active: Optional[bool] = None

class JobResponse(JobBase):
    id: int
    application_deadline: Optional[datetime] = None
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class JobApplicationBase(BaseModel):
    job_id: int
    user_id: int
    resume_id: int
    cover_letter: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None

class JobApplicationResponse(JobApplicationBase):
    id: int
    status: str
    applied_at: datetime
    
    class Config:
        from_attributes = True