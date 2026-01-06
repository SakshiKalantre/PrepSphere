from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from pathlib import Path

from app.db.session import get_db
from app.models.file import Resume, Certificate
from app.schemas.file import ResumeCreate, ResumeResponse, ResumeUpdate, CertificateCreate, CertificateResponse, CertificateUpdate
from app.core.config import settings

router = APIRouter()

# Create upload directory if it doesn't exist
Path(settings.UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: Path) -> bool:
    try:
        with destination.open("wb") as buffer:
            while chunk := upload_file.file.read(8192):
                buffer.write(chunk)
        return True
    except Exception:
        return False

@router.post("/resumes", response_model=ResumeResponse)
async def upload_resume(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = Path(settings.UPLOAD_FOLDER) / unique_filename
    
    # Save file
    if not save_upload_file(file, file_path):
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Create resume record
    resume_data = ResumeCreate(
        user_id=user_id,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file.size,
        mime_type=file.content_type
    )
    
    db_resume = Resume(**resume_data.dict())
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.post("/certificates", response_model=CertificateResponse)
async def upload_certificate(
    user_id: int = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file size
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = Path(settings.UPLOAD_FOLDER) / unique_filename
    
    # Save file
    if not save_upload_file(file, file_path):
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Create certificate record
    certificate_data = CertificateCreate(
        user_id=user_id,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file.size,
        mime_type=file.content_type,
        title=title
    )
    
    db_certificate = Certificate(**certificate_data.dict())
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)
    return db_certificate

@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return db_resume

@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
def update_resume(resume_id: int, resume_update: ResumeUpdate, db: Session = Depends(get_db)):
    db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    update_data = resume_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_resume, key, value)
    
    db.commit()
    db.refresh(db_resume)
    return db_resume

@router.delete("/resumes/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    db_resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not db_resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Delete file from storage
    try:
        os.remove(db_resume.file_path)
    except Exception:
        pass  # Log this in a real application
    
    db.delete(db_resume)
    db.commit()
    return {"message": "Resume deleted successfully"}

@router.get("/certificates/{certificate_id}", response_model=CertificateResponse)
def get_certificate(certificate_id: int, db: Session = Depends(get_db)):
    db_certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not db_certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return db_certificate

@router.put("/certificates/{certificate_id}", response_model=CertificateResponse)
def update_certificate(certificate_id: int, certificate_update: CertificateUpdate, db: Session = Depends(get_db)):
    db_certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not db_certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    update_data = certificate_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_certificate, key, value)
    
    db.commit()
    db.refresh(db_certificate)
    return db_certificate

@router.delete("/certificates/{certificate_id}")
def delete_certificate(certificate_id: int, db: Session = Depends(get_db)):
    db_certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not db_certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Delete file from storage
    try:
        os.remove(db_certificate.file_path)
    except Exception:
        pass  # Log this in a real application
    
    db.delete(db_certificate)
    db.commit()
    return {"message": "Certificate deleted successfully"}