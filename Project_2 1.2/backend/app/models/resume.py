from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False)  # S3 or server path
    is_primary = Column(Boolean, default=False)  # Student can have only one primary resume
    is_verified = Column(Boolean, default=False)  # TPO verification
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # TPO user ID
    verification_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="resumes", foreign_keys=[user_id])
