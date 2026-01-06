from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    user_id: int
    file_name: str
    file_path: str
    file_size: int
    mime_type: str

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(BaseModel):
    is_approved: Optional[bool] = None

class ResumeResponse(ResumeBase):
    id: int
    is_approved: bool
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

class CertificateBase(BaseModel):
    user_id: int
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    title: str
    issued_by: Optional[str] = None

class CertificateCreate(CertificateBase):
    issued_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class CertificateUpdate(BaseModel):
    title: Optional[str] = None
    issued_by: Optional[str] = None
    issued_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None

class CertificateResponse(CertificateBase):
    id: int
    issued_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True