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
    status: Optional[str] = None  # Allow status field from frontend
    
    def convert_status_to_is_active(self):
        """Convert status string to is_active boolean"""
        if self.status is not None:
            return self.status.lower() in ['active', 'open', 'running']
        return self.is_active

class JobResponse(JobBase):
    id: int
    application_deadline: Optional[datetime] = None
    is_active: bool
    status: Optional[str] = None
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

    @staticmethod
    def resolve_status(obj):
        return "Active" if obj.is_active else "Inactive"

    def __init__(self, **data):
        super().__init__(**data)
        if self.status is None:
             self.status = "Active" if self.is_active else "Inactive"

class JobApplicationBase(BaseModel):
    job_id: int
    user_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplyRequest(BaseModel):
    user_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None

class JobApplicationResponse(JobApplicationBase):
    id: int
    status: str
    applied_at: datetime
    
    class Config:
        from_attributes = True