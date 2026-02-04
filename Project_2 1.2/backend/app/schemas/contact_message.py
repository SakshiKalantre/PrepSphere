from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContactMessageBase(BaseModel):
    name: str
    company_name: Optional[str] = None
    designation: Optional[str] = None
    official_website: Optional[str] = None
    phone_number: Optional[str] = None
    email: str
    message: str


class ContactMessageCreate(ContactMessageBase):
    pass


class ContactMessageResponse(ContactMessageBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True