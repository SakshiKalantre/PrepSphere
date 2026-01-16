from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.models.user import User, Profile
from app.models.notification import Notification, NotificationType

router = APIRouter()


@router.put("/tpo/profiles/{user_id}/approve")
def approve_profile(
    user_id: int,
    notes: Optional[str] = None,
    sent_by: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Find the user's profile
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile.is_approved = True
    profile.approval_status = 'Approved'
    if notes:
        profile.approval_notes = notes
    
    # Also update user approval status so the student appears in approved students
    user.is_approved = True
    
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    
    # Create notification for the user
    notification = Notification(
        user_id=user.id,
        title="Profile Approved",
        message=f"Your profile has been approved by the TPO.{f' Notes: {notes}' if notes else ''}",
        sent_by=sent_by,
        notification_type=NotificationType.SYSTEM
    )
    
    db.add(notification)
    db.commit()
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "is_approved": profile.is_approved,
        "approval_status": profile.approval_status
    }


@router.put("/tpo/profiles/{user_id}/reject")
def reject_profile(
    user_id: int,
    reason: str,
    sent_by: Optional[int] = None,
    db: Session = Depends(get_db)
):
    # Find the user's profile
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get the user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile.is_approved = False
    profile.approval_status = 'Rejected'
    if reason:
        profile.approval_notes = reason
    
    # Also update user approval status
    user.is_approved = False
    
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    
    # Create notification for the user
    notification = Notification(
        user_id=user.id,
        title="Profile Rejected",
        message=reason or "Your profile was rejected.",
        sent_by=sent_by,
        notification_type=NotificationType.SYSTEM
    )
    
    db.add(notification)
    db.commit()
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "is_approved": profile.is_approved,
        "approval_status": profile.approval_status
    }