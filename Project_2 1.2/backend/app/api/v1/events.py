from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.event import Event, EventRegistration
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from pydantic import BaseModel

router = APIRouter()

class EventRegistrationCreate(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

@router.post("/{event_id}/register")
def register_event(event_id: int, registration: EventRegistrationCreate, db: Session = Depends(get_db)):
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Resolve user_id
    user_id = registration.user_id
    if not user_id:
        if not registration.email:
            raise HTTPException(status_code=400, detail="Either user_id or email is required")
        
        from app.models.user import User
        user = db.query(User).filter(User.email == registration.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found with provided email")
        user_id = user.id

    # Check if already registered
    existing_reg = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.user_id == user_id
    ).first()
    
    if existing_reg:
        raise HTTPException(status_code=400, detail="User already registered for this event")
        
    # Register
    new_reg = EventRegistration(
        event_id=event_id,
        user_id=user_id,
        registration_status="registered"
    )
    db.add(new_reg)
    
    # Update count
    event.registered_count += 1
    
    db.commit()
    db.refresh(new_reg)
    return {"message": "Successfully registered"}

@router.get("/{event_id}/registrations")
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    registrations = db.query(EventRegistration).filter(EventRegistration.event_id == event_id).all()
    return registrations

@router.post("/", response_model=EventCreate)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status)
    events = query.offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, event_update: EventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted successfully"}