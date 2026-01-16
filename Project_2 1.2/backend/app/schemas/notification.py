from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str
    message: str
    user_id: int

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    notification_type: Optional[str] = None
    sent_by: Optional[int] = None
    
    class Config:
        from_attributes = True