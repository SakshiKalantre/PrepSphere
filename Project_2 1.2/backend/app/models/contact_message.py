from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.db.session import Base


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Contact Person
    company_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    official_website = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    email = Column(String, nullable=False)  # Official Email
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())