from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.models.user import User, UserRole, Profile
from app.models.job import Job, JobApplication
from app.models.event import Event, EventRegistration
from app.models.notification import Notification, NotificationType
from app.schemas.job import JobCreate, JobResponse, JobUpdate, JobApplicationResponse
from app.schemas.event import EventCreate, EventResponse, EventUpdate

from app.models.file import FileUpload

router = APIRouter()

# --- TPO Event Management ---

@router.post("/events", response_model=EventCreate)
def create_tpo_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/events/{event_id}/registrations")
def get_tpo_event_registrations(event_id: int, db: Session = Depends(get_db)):
    # Get registrations with user details
    results = db.query(EventRegistration, User).join(User, EventRegistration.user_id == User.id).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    response = []
    for reg, user in results:
        response.append({
            "id": reg.id,
            "user_id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "status": reg.registration_status,
            "registered_at": reg.registered_at
        })
    return response

@router.get("/jobs/{job_id}/applications")
def get_tpo_job_applications(job_id: int, db: Session = Depends(get_db)):
    # Get applications with user details
    results = db.query(JobApplication, User).join(User, JobApplication.user_id == User.id).filter(
        JobApplication.job_id == job_id
    ).all()
    
    response = []
    for app, user in results:
        response.append({
            "id": app.id,
            "user_id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "status": app.status,
            "applied_at": app.applied_at,
            "resume_id": app.resume_id
        })
    return response

@router.post("/jobs", response_model=JobResponse)
def create_tpo_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

# --- TPO Profile & Dashboard Stats ---

@router.get("/{user_id}/profile")
def get_tpo_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        return {} # Return empty object if no profile found
    return profile

@router.get("/stats/summary")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_jobs = db.query(Job).count()
    total_applications = db.query(JobApplication).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    
    # Count placed students (those with placement_status='Placed')
    total_placed = db.query(Profile).filter(Profile.placement_status == 'Placed').count()
    
    # Calculate selected (hired) applications if applicable, or use placement count
    total_selected = total_placed 
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_selected": total_selected,
        "total_students": total_students,
        "total_placed": total_placed,
        "applications_by_job": [] # Can be populated if needed
    }

# --- Student Management ---

@router.get("/pending-profiles")
def get_pending_profiles(db: Session = Depends(get_db)):
    # Fetch students who are not approved yet
    users = db.query(User).outerjoin(Profile).filter(
        User.role == UserRole.STUDENT,
        User.is_approved == False
    ).all()
    
    result = []
    for u in users:
        # Get profile data
        profile = db.query(Profile).filter(Profile.user_id == u.id).first()
        result.append({
            "user_id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "degree": profile.degree if profile else "N/A",
            "year": profile.year if profile else "N/A"
        })
    return result

@router.get("/approved-students")
def get_approved_students(db: Session = Depends(get_db)):
    users = db.query(User).join(Profile).filter(
        User.role == UserRole.STUDENT,
        User.is_approved == True
    ).all()
    
    result = []
    for u in users:
        profile = db.query(Profile).filter(Profile.user_id == u.id).first()
        
        # Get resume info
        resume = db.query(FileUpload).filter(
            FileUpload.user_id == u.id,
            FileUpload.file_type == 'resume',
            FileUpload.is_verified == True
        ).first()
        
        # Get offer letter info
        offer_letter = db.query(FileUpload).filter(
            FileUpload.user_id == u.id,
            FileUpload.file_type == 'offer_letter',
            FileUpload.is_verified == True
        ).first()
        
        result.append({
            "user_id": u.id,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "phone": u.phone_number,
            "degree": profile.degree if profile else "",
            "year": profile.year if profile else "",
            "skills": profile.skills if profile else "",
            "about": profile.about if profile else "",
            "placement_status": profile.placement_status if profile else "Not Placed",
            "company_name": profile.company_name if profile else "",
            "resume_id": resume.id if resume else None,
            "offer_letter_url": profile.offer_letter_url if profile and profile.offer_letter_url else "",
            "offer_letter_id": offer_letter.id if offer_letter else None
        })
    return result

# --- Resume Management ---

@router.get("/pending-resumes")
def get_pending_resumes(db: Session = Depends(get_db)):
    # Fetch files that are resumes and status is Pending
    files = db.query(FileUpload).join(User).filter(
        FileUpload.file_type == 'resume',
        FileUpload.status == 'Pending'
    ).all()
    
    result = []
    for f in files:
        result.append({
            "id": f.id,
            "first_name": f.user.first_name,
            "last_name": f.user.last_name,
            "email": f.user.email,
            "file_name": f.file_name,
            "uploaded_at": f.uploaded_at,
            "status": f.status,
            "file_url": f.file_url
        })
    return result

@router.get("/verified-resumes")
def get_verified_resumes(db: Session = Depends(get_db)):
    # Fetch files that are resumes and status is Verified
    files = db.query(FileUpload).join(User).filter(
        FileUpload.file_type == 'resume',
        FileUpload.status == 'Verified'
    ).all()
    
    result = []
    for f in files:
        result.append({
            "id": f.id,
            "first_name": f.user.first_name,
            "last_name": f.user.last_name,
            "email": f.user.email,
            "file_name": f.file_name,
            "uploaded_at": f.uploaded_at,
            "status": f.status,
            "file_url": f.file_url
        })
    return result

class NotificationFilters(BaseModel):
    degree: str
    year: str

class NotificationBroadcast(BaseModel):
    title: str
    message: str
    filters: NotificationFilters

# --- Notifications ---

@router.post("/notifications/broadcast")
def broadcast_notification(
    payload: NotificationBroadcast,
    db: Session = Depends(get_db)
):
    # Join User and Profile to filter students
    query = db.query(User).join(Profile).filter(User.role == UserRole.STUDENT)
    
    if payload.filters.degree:
        query = query.filter(Profile.degree == payload.filters.degree)
    if payload.filters.year:
        query = query.filter(Profile.year == payload.filters.year)
        
    students = query.all()
    count = 0
    
    for student in students:
        notif = Notification(
            user_id=student.id,
            title=payload.title,
            message=payload.message,
            notification_type=NotificationType.SYSTEM,
            is_read=False
        )
        db.add(notif)
        count += 1
        
    db.commit()
    return {"count": count, "message": f"Sent to {count} students"}

@router.get("/notifications/history")
def get_notification_history(db: Session = Depends(get_db)):
    recent_notifs = db.query(Notification).filter(
        Notification.notification_type == NotificationType.SYSTEM
    ).order_by(Notification.created_at.desc()).limit(500).all()
    
    history = []
    if not recent_notifs:
        return history
        
    current_group = None
    
    for notif in recent_notifs:
        is_match = False
        if current_group:
            time_diff = abs((current_group['sent_at'] - notif.created_at).total_seconds())
            if (current_group['title'] == notif.title and 
                current_group['message'] == notif.message and 
                time_diff < 60): 
                is_match = True
        
        if is_match:
            current_group['recipient_count'] += 1
        else:
            if current_group:
                history.append(current_group)
            
            current_group = {
                "title": notif.title,
                "message": notif.message,
                "sent_at": notif.created_at,
                "recipient_count": 1
            }
            
    if current_group:
        history.append(current_group)
        
    return history[:20]

# --- Jobs ---

@router.get("/test")
def test_endpoint():
    return {"message": "Test working"}

@router.get("/jobs", response_model=List[JobResponse])
def get_tpo_jobs(
    status: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    try:
        with open("debug_tpo.log", "a") as f:
            f.write("Hitting get_tpo_jobs\n")
            
        query = db.query(Job)
        
        if status:
            if status == "Active":
                query = query.filter(Job.is_active == True)
            elif status == "Inactive":
                 query = query.filter(Job.is_active == False)
                 
        jobs = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
        
        with open("debug_tpo.log", "a") as f:
            f.write(f"Found {len(jobs)} jobs\n")
        
        # Populate status field for response
        response_list = []
        for job in jobs:
            with open("debug_tpo.log", "a") as f:
                f.write(f"Processing job {job.id}\n")
            # Create Pydantic model from ORM object
            job_resp = JobResponse.model_validate(job)
            # Set computed status
            job_resp.status = "Active" if job.is_active else "Inactive"
            response_list.append(job_resp)
            
        return response_list
    except Exception as e:
        with open("debug_tpo.log", "a") as f:
            f.write(f"Error: {str(e)}\n")
            import traceback
            traceback.print_exc(file=f)
        print(f"Error in get_tpo_jobs: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs", response_model=JobResponse)
def create_tpo_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_tpo_job(job_id: int, job_update: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Handle status conversion to is_active
    if job_update.status is not None:
        # Convert status string to is_active boolean
        db_job.is_active = job_update.convert_status_to_is_active()
        # Update the status field to match the is_active value
        db_job.status = "Active" if db_job.is_active else "Inactive"
    else:
        # Update other fields normally
        update_data = job_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key != 'is_active':  # Don't double-set is_active
                setattr(db_job, key, value)
        
        # If is_active was explicitly passed, update status accordingly
        if job_update.is_active is not None:
            db_job.status = "Active" if job_update.is_active else "Inactive"
    
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete("/jobs/{job_id}")
def delete_tpo_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.get("/jobs/{job_id}/applications", response_model=List[JobApplicationResponse])
def get_job_applications(job_id: int, db: Session = Depends(get_db)):
    applications = db.query(JobApplication).filter(JobApplication.job_id == job_id).all()
    return applications

# --- Events ---

@router.get("/events", response_model=List[EventResponse])
def get_tpo_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    return events

@router.post("/events", response_model=EventResponse)
def create_tpo_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/events/{event_id}", response_model=EventResponse)
def update_tpo_event(event_id: int, event_update: EventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/events/{event_id}")
def delete_tpo_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted successfully"}

@router.get("/events/{event_id}/registrations")
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    # Custom response structure as needed by frontend
    registrations = db.query(EventRegistration).filter(EventRegistration.event_id == event_id).all()
    
    result = []
    for reg in registrations:
        result.append({
            "id": reg.id,
            "user_id": reg.user_id,
            "name": f"{reg.user.first_name} {reg.user.last_name}",
            "email": reg.user.email,
            "status": reg.registration_status,
            "registered_at": reg.registered_at
        })
    return result
