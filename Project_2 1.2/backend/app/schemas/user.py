from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "STUDENT"
    TPO = "TPO"
    ADMIN = "ADMIN"

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.STUDENT
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    clerk_user_id: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None

class UserResponse(UserBase):
    id: int
    clerk_user_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    phone: Optional[str] = None
    degree: Optional[str] = None
    year: Optional[str] = None
    skills: Optional[str] = None
    about: Optional[str] = None
    alternate_email: Optional[str] = None
    placement_status: Optional[str] = "Not Placed"
    company_name: Optional[str] = None
    offer_letter_url: Optional[str] = None
    approval_status: Optional[str] = "Pending"

class ProfileCreate(ProfileBase):
    user_id: int

class ProfileUpdate(ProfileBase):
    is_approved: Optional[bool] = None

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    is_approved: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserRegistration(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: str
    password: str
    role: str = "student"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
