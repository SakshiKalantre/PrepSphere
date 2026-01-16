from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, BigInteger, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class FileUpload(Base):
    __tablename__ = "file_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # S3 or server path
    file_size = Column(BigInteger, nullable=False)
    mime_type = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # resume, certificate, document, etc.
    file_url = Column(String, nullable=True)
    file_hash = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, nullable=True)
    verification_notes = Column(Text, nullable=True)
    status = Column(String, default='Pending')
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")