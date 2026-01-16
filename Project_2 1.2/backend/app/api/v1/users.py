from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from passlib.context import CryptContext
from werkzeug.security import check_password_hash
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os

from app.db.session import get_db
from app.models.user import User, Profile, PasswordResetToken
from app.schemas.user import UserCreate, UserResponse, UserUpdate, ProfileCreate, ProfileResponse, ProfileUpdate, ProfileBase, UserRegistration, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

@router.get("/by-email")
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role.value if hasattr(db_user.role, "value") else db_user.role,
        "clerk_user_id": db_user.clerk_user_id
    }

@router.get("/by-email/{email}")
def get_user_by_email_path(email: str, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role.value if hasattr(db_user.role, "value") else db_user.role,
        "clerk_user_id": db_user.clerk_user_id
    }

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists by email
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already registered")
    
    # Create new user
    db_user = User(
        clerk_user_id=user.clerk_user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        phone_number=user.phone_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/register")
def register_user(
    user_data: UserRegistration,
    db: Session = Depends(get_db)
):
    """Register a new user with email/password authentication"""
    # Extract data from the validated request body
    email = user_data.email
    first_name = user_data.first_name
    last_name = user_data.last_name
    phone_number = user_data.phone_number
    password = user_data.password
    role = user_data.role
    
    # Check if user already exists
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User with this email already registered")
    
    # Hash the password using werkzeug instead of bcrypt due to library issues
    from werkzeug.security import generate_password_hash
    hashed_password = generate_password_hash(password)
    
    # Generate a unique user ID if needed
    clerk_user_id = f"local_{secrets.token_hex(8)}"
    
    # Create new user - ensure role is in uppercase to match enum values
    role_upper = role.upper()
    if role_upper not in ['STUDENT', 'TPO', 'ADMIN']:
        role_upper = 'STUDENT'  # Default to STUDENT if invalid role provided
    
    db_user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role_upper,
        phone_number=phone_number,
        hashed_password=hashed_password  # Assuming User model has this field
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {"id": db_user.id, "email": db_user.email, "role": db_user.role.value}

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.post("/login")
def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user with email and password"""
    # Extract data from the validated request body
    email = login_data.email
    password = login_data.password
    
    # Find user by email
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user has a hashed password (local auth) and verify it
    if not db_user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify the password - try both bcrypt and werkzeug methods
    password_valid = False
    try:
        # Try bcrypt verification first
        if pwd_context.verify(password, db_user.hashed_password):
            password_valid = True
    except:
        # If bcrypt fails, try werkzeug verification
        try:
            if check_password_hash(db_user.hashed_password, password):
                password_valid = True
        except:
            password_valid = False
    
    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "role": db_user.role.value,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "phone_number": db_user.phone_number
    }


def send_reset_email(to_email: str, reset_token: str):
    """Send password reset email using SMTP"""
    # Use the provided SMTP credentials directly
    smtp_host = 'smtp.gmail.com'
    smtp_port = 587
    smtp_user = 'maneswapnil.0406@gmail.com'
    smtp_pass = 'glvuhgbcsqjqnkvk'
    smtp_from = 'PrepSphere <maneswapnil.0406@gmail.com>'
    
    # Create the reset link (using the actual frontend port)
    reset_link = f"http://localhost:3003/reset-password?token={reset_token}"
    
    # Create email content
    subject = "Password Reset Request - PrepSphere"
    body = f"""
    Dear User,
    
    You have requested to reset your password for your PrepSphere account.
    
    Please click the link below to reset your password:
    
    {reset_link}
    
    This link will expire in 1 hour.
    
    If you did not request this password reset, please ignore this email.
    
    Best regards,
    The PrepSphere Team
    """
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = smtp_from
    msg['To'] = to_email
    msg['Subject'] = subject
    
    # Attach body to email
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # Create SMTP session
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()  # Enable security
        server.login(smtp_user, smtp_pass)  # Login with sender's email and password
        
        # Convert message to string and send
        text = msg.as_string()
        server.sendmail(smtp_user, to_email, text)
        server.quit()
        
        print(f"Password reset email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Error occurred while sending email: {str(e)}")
        return False


@router.post("/forgot-password")
def forgot_password(
    reset_request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Generate password reset token and send email"""
    # Extract data from the validated request body
    email = reset_request.email
    
    # Find user by email
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        # Return success even if user doesn't exist to prevent email enumeration
        return {"message": "If an account with this email exists, a password reset link has been sent"}
    
    # Delete any existing unexpired tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == db_user.id,
        PasswordResetToken.expires_at > datetime.now(),
        PasswordResetToken.used == False
    ).delete()
    
    # Generate a reset token
    reset_token = secrets.token_urlsafe(32)
    
    # Set expiration time (1 hour from now)
    expires_at = datetime.now() + timedelta(hours=1)
    
    # Create password reset token record
    reset_token_record = PasswordResetToken(
        user_id=db_user.id,
        token=reset_token,
        expires_at=expires_at
    )
    
    db.add(reset_token_record)
    db.commit()
    
    # Send reset email
    email_sent = send_reset_email(db_user.email, reset_token)
    
    if not email_sent:
        # If email fails, remove the token and return error
        db.delete(reset_token_record)
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    
    return {"message": "Password reset link has been sent to your email address"}


@router.post("/reset-password")
def reset_password(
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset user password with token"""
    # Extract data from the validated request body
    token = reset_data.token
    new_password = reset_data.new_password
    
    # Find the reset token
    reset_token_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.expires_at > datetime.now(),
        PasswordResetToken.used == False
    ).first()
    
    if not reset_token_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Get the user associated with the token
    user = db.query(User).filter(User.id == reset_token_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password using werkzeug instead of bcrypt due to library issues
    from werkzeug.security import generate_password_hash
    hashed_password = generate_password_hash(new_password)
    
    # Update the user's password
    user.hashed_password = hashed_password
    
    # Mark the token as used
    reset_token_record.used = True
    
    # Commit both changes in a single transaction
    db.commit()
    
    return {"message": "Password has been reset successfully"}

@router.get("/clerk/{clerk_user_id}", response_model=UserResponse)
def get_user_by_clerk_id(clerk_user_id: str, db: Session = Depends(get_db)):
    """
    Get user by Clerk user ID
    """
    db_user = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/{user_id}/profile", response_model=ProfileResponse)
def create_user_profile(user_id: int, profile: ProfileBase, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if profile already exists
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if db_profile:
        # Update existing profile
        update_data = profile.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_profile, key, value)
        db.commit()
        db.refresh(db_profile)
        return db_profile
    
    # Create new profile
    profile_data = profile.dict()
    profile_data['user_id'] = user_id
    db_profile = Profile(**profile_data)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/{user_id}/profile", response_model=ProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return db_profile

@router.put("/{user_id}/profile", response_model=ProfileResponse)
def update_user_profile(user_id: int, profile_update: ProfileUpdate, db: Session = Depends(get_db)):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
