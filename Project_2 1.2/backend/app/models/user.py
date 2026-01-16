from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base
from enum import Enum as PyEnum

class UserRole(str, PyEnum):
    STUDENT = "STUDENT"
    TPO = "TPO"
    ADMIN = "ADMIN"
    
    @classmethod
    def _missing_(cls, value):
        # Handle case-insensitive matching for existing database values
        if isinstance(value, str):
            upper_value = value.upper()
            for member in cls:
                if member.value == upper_value:
                    return member
            # If no match, default to STUDENT
            return cls.STUDENT
        return None

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=False)  # For TPO and Admin approval
    profile_complete = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=True)  # For local authentication
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan", foreign_keys="[Resume.user_id]")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan", foreign_keys="[Certificate.user_id]")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan", foreign_keys="[Notification.user_id]")

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    phone = Column(String, nullable=True)
    degree = Column(String, nullable=True)
    year = Column(String, nullable=True)
    skills = Column(Text, nullable=True)  # Comma-separated skills
    about = Column(Text, nullable=True)
    profile_image_url = Column(String, nullable=True)
    
    # Extended fields from server.js
    alternate_email = Column(String, nullable=True)
    placement_status = Column(String, default='Not Placed')
    approval_status = Column(String, default='Pending')
    company_name = Column(String, nullable=True)
    offer_letter_url = Column(String, nullable=True)
    
    is_approved = Column(Boolean, default=False)
    approval_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")


# Password Reset Token Model
from datetime import datetime, timedelta
class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="reset_tokens")


# Add relationship to User model (after both classes are defined)
User.reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")