from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)  # Certificate name
    issuer = Column(String, nullable=False)  # Organization that issued
    issue_date = Column(DateTime(timezone=True), nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    credential_url = Column(String, nullable=True)  # Link to certificate
    description = Column(Text, nullable=True)
    file_url = Column(String, nullable=True)  # PDF/Image of certificate
    is_verified = Column(Boolean, default=False)  # TPO verification
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # TPO user ID
    verification_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="certificates", foreign_keys=[user_id])
