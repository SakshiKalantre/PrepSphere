from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
from enum import Enum as PyEnum

class NotificationType(str, PyEnum):
    JOB_ALERT = "JOB_ALERT"
    APPLICATION_UPDATE = "APPLICATION_UPDATE"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    EVENT_REMINDER = "EVENT_REMINDER"
    PROFILE_APPROVED = "PROFILE_APPROVED"
    PROFILE_REJECTED = "PROFILE_REJECTED"
    SYSTEM = "SYSTEM"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), default=NotificationType.SYSTEM, nullable=False)
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)  # Job ID, Application ID, etc.
    related_type = Column(String, nullable=True)  # job, application, event, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    sent_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # ID of user who sent the notification (TPO, etc.)
    
    # Relationships
    user = relationship("User", back_populates="notifications", foreign_keys=[user_id])
    sender = relationship("User", foreign_keys=[sent_by])