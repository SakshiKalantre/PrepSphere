from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact_message import ContactMessageCreate, ContactMessageResponse

router = APIRouter()


@router.post("/contact-messages", response_model=ContactMessageResponse)
def create_contact_message(
    contact_message: ContactMessageCreate, db: Session = Depends(get_db)
):
    db_contact_message = ContactMessage(**contact_message.dict())
    db.add(db_contact_message)
    db.commit()
    db.refresh(db_contact_message)
    return db_contact_message


@router.get("/contact-messages", response_model=List[ContactMessageResponse])
def get_contact_messages(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    contact_messages = (
        db.query(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return contact_messages


@router.get("/contact-messages/{contact_message_id}", response_model=ContactMessageResponse)
def get_contact_message(
    contact_message_id: int, db: Session = Depends(get_db)
):
    contact_message = (
        db.query(ContactMessage)
        .filter(ContactMessage.id == contact_message_id)
        .first()
    )
    if not contact_message:
        raise HTTPException(status_code=404, detail="Contact message not found")
    return contact_message


@router.put("/contact-messages/{contact_message_id}/read", response_model=ContactMessageResponse)
def mark_contact_message_as_read(
    contact_message_id: int, db: Session = Depends(get_db)
):
    contact_message = (
        db.query(ContactMessage)
        .filter(ContactMessage.id == contact_message_id)
        .first()
    )
    if not contact_message:
        raise HTTPException(status_code=404, detail="Contact message not found")
    
    contact_message.is_read = True
    db.commit()
    db.refresh(contact_message)
    return contact_message