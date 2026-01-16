from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate

router = APIRouter()

@router.post("/", response_model=NotificationResponse)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifications = db.query(Notification).offset(skip).limit(limit).all()
    return notifications

@router.get("/user/{user_id}", response_model=List[NotificationResponse])
def get_user_notifications(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        notifications = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
        # Debug: Print first notification
        if notifications:
            print(f"DEBUG: Found {len(notifications)} notifications")
            print(f"DEBUG: First notification: {notifications[0].__dict__}")
        return notifications
    except Exception as e:
        print(f"ERROR in get_user_notifications: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(notification_id: int, db: Session = Depends(get_db)):
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.put("/{notification_id}", response_model=NotificationResponse)
def update_notification(notification_id: int, notification_update: NotificationUpdate, db: Session = Depends(get_db)):
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    update_data = notification_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_notification, key, value)
    
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(db_notification)
    db.commit()
    return {"message": "Notification deleted successfully"}


from pydantic import BaseModel


class NotificationSendRequest(BaseModel):
    student_email: str
    message: str
    title: str = "Message from TPO"
    sent_by: int = None


@router.post("/send")
def send_notification(
    request: NotificationSendRequest,
    db: Session = Depends(get_db)
):
    # Find student by email
    student = db.query(User).filter(User.email == request.student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Create notification
    notification = Notification(
        user_id=student.id,
        title=request.title,
        message=request.message,
        sent_by=request.sent_by,
        notification_type="SYSTEM"
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {"success": True, "message": "Notification sent successfully"}