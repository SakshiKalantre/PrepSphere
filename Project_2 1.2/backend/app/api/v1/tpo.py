from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

class ProfileApproveRequest(BaseModel):
    notes: Optional[str] = None
    sent_by: Optional[int] = None

class ProfileRejectRequest(BaseModel):
    reason: str
    sent_by: Optional[int] = None

from app.db.session import get_db
from app.models.user import User, UserRole, Profile
from app.models.job import Job, JobApplication
from app.models.event import Event, EventRegistration
from app.models.notification import Notification, NotificationType
from app.schemas.job import JobCreate, JobResponse, JobUpdate, JobApplicationResponse
from app.schemas.event import EventCreate, EventResponse, EventUpdate

from app.models.file import FileUpload
from app.models.analytics import AnalyticsPercentages
from app.schemas.analytics import AnalyticsPercentagesResponse

router = APIRouter()

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
    
    # Count placed students (those with placement_status='Placed') - properly joined with students
    total_placed = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Placed'
    ).count()
    
    # Count unplaced students (those with placement_status='Not Placed') - properly joined with students
    total_unplaced = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed'
    ).count()
    
    # Count unplaced students by reason
    unplaced_higher_studies = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Higher Studies'
    ).count()
    
    unplaced_exploring = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Exploring'
    ).count()
    
    unplaced_others = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Others'
    ).count()
    
    # Calculate selected (hired) applications if applicable, or use placement count
    total_selected = total_placed 
    
    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_selected": total_selected,
        "total_students": total_students,
        "total_placed": total_placed,
        "total_unplaced": total_unplaced,
        "unplaced_reasons": {
            "higherStudies": unplaced_higher_studies,
            "exploring": unplaced_exploring,
            "others": unplaced_others
        },
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
        
        # Get offer letter info (any offer letter, regardless of verification status)
        offer_letter = db.query(FileUpload).filter(
            FileUpload.user_id == u.id,
            FileUpload.file_type == 'offer_letter'
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
    
    # Update standard fields first
    update_data = job_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key not in ['status', 'is_active']:
            setattr(db_job, key, value)
            
    # Handle status conversion to is_active
    if job_update.status is not None:
        db_job.status = job_update.status
        # Sync is_active based on status string
        # 'Active' -> True, anything else ('Closed', 'Inactive') -> False
        db_job.is_active = (job_update.status == 'Active')
    elif job_update.is_active is not None:
        db_job.is_active = job_update.is_active
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

@router.post("/events/{event_id}/reminders")
def send_event_reminders(event_id: int, db: Session = Depends(get_db)):
    # Get the event
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get all users registered for this event
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    # Get the users who registered
    user_ids = [reg.user_id for reg in registrations]
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    
    # Create notifications for each registered user
    reminder_title = f"Reminder: {event.title}"
    reminder_message = f"Don't forget about the event '{event.title}' happening on {event.event_date.strftime('%B %d, %Y')} at {event.location}."
    
    for user in users:
        notification = Notification(
            user_id=user.id,
            title=reminder_title,
            message=reminder_message,
            notification_type=NotificationType.EVENT_REMINDER,
            is_read=False
        )
        db.add(notification)
    
    db.commit()
    
    return {"message": f"Reminders sent to {len(users)} registered users", "count": len(users)}


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


# --- Profiles Approval ---

@router.put("/profiles/{user_id}/approve")
def approve_profile(
    user_id: int,
    request: ProfileApproveRequest,
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
    if request.notes:
        profile.approval_notes = request.notes
    
    # Also update user approval status so the student appears in approved students
    user.is_approved = True
    
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    
    # Create notification for the user
    notification = Notification(
        user_id=user.id,
        title="Profile Approved",
        message=f"Your profile has been approved by the TPO.{f' Notes: {request.notes}' if request.notes else ''}",
        sent_by=request.sent_by,
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


@router.post("/analytics-percentages/calculate")
def calculate_and_store_analytics_percentages_for_tpo(db: Session = Depends(get_db)):
    """Calculate analytics percentages using the given formulas and store them in the database"""
    from app.models.notification import Notification
    from app.models.event import EventRegistration
    
    # Get the counts needed for calculations
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    
    # Count placed students - properly joined with students
    placed_students = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Placed'
    ).count()
    
    # Count unplaced students - properly joined with students
    unplaced_students = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed'
    ).count()
    
    # Count unplaced students by reason
    higher_studies_count = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Higher Studies'
    ).count()
    
    exploring_count = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Exploring'
    ).count()
    
    others_count = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed',
        Profile.unplaced_reason == 'Others'
    ).count()
    
    # Calculate percentages using the provided formulas:
    # 1. placedPercentage = (placedStudents / totalStudents) * 100
    placed_percentage = (placed_students / total_students * 100) if total_students > 0 else 0
    
    # 2. unplacedPercentage = (unplacedStudents / totalStudents) * 100
    unplaced_percentage = (unplaced_students / total_students * 100) if total_students > 0 else 0
    
    # 3. higherStudiesPercentage = (higherStudiesCount / unplacedStudents) * 100
    higher_studies_percentage = (higher_studies_count / unplaced_students * 100) if unplaced_students > 0 else 0
    
    # 4. exploringPercentage = (exploringCount / unplacedStudents) * 100
    exploring_percentage = (exploring_count / unplaced_students * 100) if unplaced_students > 0 else 0
    
    # 5. othersPercentage = (othersCount / unplacedStudents) * 100
    others_percentage = (others_count / unplaced_students * 100) if unplaced_students > 0 else 0
    
    # Calculate placement rate percentage - same as placed percentage
    placement_rate_percentage = placed_percentage
    
    # Create or update the analytics percentages record
    # First, check if a record already exists
    existing_record = db.query(AnalyticsPercentages).order_by(AnalyticsPercentages.id.desc()).first()
    
    if existing_record:
        # Update the existing record
        existing_record.placed_percentage = placed_percentage
        existing_record.unplaced_percentage = unplaced_percentage
        existing_record.higher_studies_percentage = higher_studies_percentage
        existing_record.exploring_percentage = exploring_percentage
        existing_record.others_percentage = others_percentage
        existing_record.placement_rate_percentage = placement_rate_percentage
        existing_record.total_students = total_students
        existing_record.placed_students = placed_students
        existing_record.unplaced_students = unplaced_students
        existing_record.higher_studies_count = higher_studies_count
        existing_record.exploring_count = exploring_count
        existing_record.others_count = others_count
        
        db.commit()
        db.refresh(existing_record)
        
        return AnalyticsPercentagesResponse.from_orm(existing_record)
    else:
        # Create a new record
        analytics_percentages = AnalyticsPercentages(
            placed_percentage=placed_percentage,
            unplaced_percentage=unplaced_percentage,
            higher_studies_percentage=higher_studies_percentage,
            exploring_percentage=exploring_percentage,
            others_percentage=others_percentage,
            placement_rate_percentage=placement_rate_percentage,
            total_students=total_students,
            placed_students=placed_students,
            unplaced_students=unplaced_students,
            higher_studies_count=higher_studies_count,
            exploring_count=exploring_count,
            others_count=others_count
        )
        
        db.add(analytics_percentages)
        db.commit()
        db.refresh(analytics_percentages)
        
        return AnalyticsPercentagesResponse.from_orm(analytics_percentages)


@router.put("/profiles/{user_id}/reject")
def reject_profile(
    user_id: int,
    request: ProfileRejectRequest,
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
    if request.reason:
        profile.approval_notes = request.reason
    
    # Also update user approval status
    user.is_approved = False
    
    db.commit()
    db.refresh(profile)
    db.refresh(user)
    
    # Create notification for the user
    notification = Notification(
        user_id=user.id,
        title="Profile Rejected",
        message=request.reason or "Your profile was rejected.",
        sent_by=request.sent_by,
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
