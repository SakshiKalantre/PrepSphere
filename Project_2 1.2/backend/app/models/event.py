from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)
    event_time = Column(String, nullable=False)
    status = Column(String, default="Upcoming")  # Upcoming, Completed, Cancelled
    event_type = Column(String, nullable=True)  # workshop, interview, seminar, etc.
    capacity = Column(Integer, nullable=True)  # Max participants
    registered_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_online = Column(Boolean, default=False)
    meeting_link = Column(String, nullable=True)  # For online events
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # TPO user ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")
    registrations = relationship("EventRegistration", back_populates="event", cascade="all, delete-orphan")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    registration_status = Column(String, default="registered")  # registered, attended, cancelled
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    attended_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User")