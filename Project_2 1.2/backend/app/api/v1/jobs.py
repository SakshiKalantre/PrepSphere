from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.job import Job, JobApplication
from app.schemas.job import JobCreate, JobResponse, JobUpdate, JobApplicationCreate, JobApplicationResponse, JobApplicationUpdate, JobApplyRequest

router = APIRouter()

@router.post("/", response_model=JobResponse)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    db_job = Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/", response_model=List[JobResponse])
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job

@router.post("/{job_id}/apply")
def apply_job(job_id: int, application: JobApplyRequest, db: Session = Depends(get_db)):
    # Check if job exists
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Check if already applied
    existing_app = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.user_id == application.user_id
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="Already applied to this job")
        
    # Get primary resume if not provided
    resume_id = application.resume_id
    if not resume_id:
        # Fetch primary resume for user
        # Import Resume model here to avoid circular import if necessary, or assume it's available
        from app.models.resume import Resume
        primary_resume = db.query(Resume).filter(Resume.user_id == application.user_id, Resume.is_primary == True).first()
        if primary_resume:
            resume_id = primary_resume.id
        else:
            # Fallback to any resume
            any_resume = db.query(Resume).filter(Resume.user_id == application.user_id).first()
            if any_resume:
                resume_id = any_resume.id
            # If still no resume, it will be None (which is allowed by model)

    # Create application
    db_application = JobApplication(
        job_id=job_id,
        user_id=application.user_id,
        resume_id=resume_id,
        cover_letter=application.cover_letter,
        status="PENDING"
    )
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobUpdate, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    db.delete(db_job)
    db.commit()
    return {"message": "Job deleted successfully"}

@router.post("/applications", response_model=JobApplicationResponse)
def create_application(application: JobApplicationCreate, db: Session = Depends(get_db)):
    # Check if job exists
    db_job = db.query(Job).filter(Job.id == application.job_id).first()
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user exists
    # (In a real app, you would also verify the user exists)
    
    # Create application
    db_application = JobApplication(**application.dict())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@router.get("/applications/", response_model=List[JobApplicationResponse])
def get_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    applications = db.query(JobApplication).offset(skip).limit(limit).all()
    return applications


@router.get("/applications/user/{user_id}", response_model=List[JobApplicationResponse])
def get_user_applications(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    applications = db.query(JobApplication).filter(JobApplication.user_id == user_id).offset(skip).limit(limit).all()
    return applications

@router.put("/applications/{application_id}", response_model=JobApplicationResponse)
def update_application(application_id: int, application_update: JobApplicationUpdate, db: Session = Depends(get_db)):
    db_application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
    if not db_application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = application_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_application, key, value)
    
    db.commit()
    db.refresh(db_application)
    return db_application