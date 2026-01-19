from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ContactMessageBase(BaseModel):
    name: str
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