from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
import base64
import hashlib
from datetime import datetime

from app.db.session import get_db
from app.models.file import FileUpload
from app.models.user import User
from app.core.config import settings

router = APIRouter()

# Initialize S3 client
s3_client = None
if settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY and settings.R2_ENDPOINT:
    s3_client = boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name='auto'
    )

# Create local upload directory if it doesn't exist
Path(settings.UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)

def get_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

@router.post("/upload-r2-multipart")
async def upload_r2_multipart(
    user_id: int = Form(...),
    file_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate file size
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit")
    
    # Read file content
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
         raise HTTPException(status_code=400, detail="File size exceeds limit")

    file_hash = get_file_hash(content)
    
    # Generate safe filename and key
    safe_name = f"{int(datetime.now().timestamp())}_{file.filename}"
    object_key = f"{user_id}/{safe_name}"
    
    file_url = ""
    file_path = ""

    if s3_client and settings.R2_BUCKET_NAME:
        try:
            s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=object_key,
                Body=content,
                ContentType=file.content_type
            )
            file_url = f"{settings.R2_ENDPOINT}/{settings.R2_BUCKET_NAME}/{object_key}"
            file_path = object_key
        except Exception as e:
            print(f"R2 upload error: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload to cloud storage")
    else:
        # Fallback to local storage
        local_filename = f"{uuid.uuid4()}_{file.filename}"
        local_path = Path(settings.UPLOAD_FOLDER) / local_filename
        with open(local_path, "wb") as f:
            f.write(content)
        file_path = str(local_path)
        file_url = f"{settings.API_V1_STR}/files/{local_filename}/download" # Placeholder

    # Save to DB
    db_file = FileUpload(
        user_id=user_id,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type,
        file_type=file_type,
        file_url=file_url,
        file_hash=file_hash,
        status="Pending"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.post("/upload")
async def upload_base64(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    user_id = payload.get("user_id")
    file_name = payload.get("file_name")
    mime_type = payload.get("mime_type")
    file_type = payload.get("file_type")
    content_base64 = payload.get("content_base64")

    if not all([user_id, file_name, mime_type, file_type, content_base64]):
        raise HTTPException(status_code=400, detail="Missing fields")

    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        content = base64.b64decode(content_base64)
    except:
        raise HTTPException(status_code=400, detail="Invalid base64 content")

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds limit")

    file_hash = get_file_hash(content)
    
    safe_name = f"{int(datetime.now().timestamp())}_{file_name}"
    object_key = f"{user_id}/{safe_name}"
    
    file_url = ""
    file_path = ""

    if s3_client and settings.R2_BUCKET_NAME:
        try:
            s3_client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=object_key,
                Body=content,
                ContentType=mime_type
            )
            file_url = f"{settings.R2_ENDPOINT}/{settings.R2_BUCKET_NAME}/{object_key}"
            file_path = object_key
        except Exception as e:
            print(f"R2 upload error: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload to cloud storage")
    else:
        local_filename = f"{uuid.uuid4()}_{file_name}"
        local_path = Path(settings.UPLOAD_FOLDER) / local_filename
        with open(local_path, "wb") as f:
            f.write(content)
        file_path = str(local_path)
        file_url = f"{settings.API_V1_STR}/files/local/{local_filename}"

    db_file = FileUpload(
        user_id=user_id,
        file_name=file_name,
        file_path=file_path,
        file_size=len(content),
        mime_type=mime_type,
        file_type=file_type,
        file_url=file_url,
        file_hash=file_hash,
        status="Pending"
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.post("/upload-r2")
async def upload_r2_base64(
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    return await upload_base64(payload, db)

@router.get("/by-user/{user_id}")
async def get_user_files(user_id: int, db: Session = Depends(get_db)):
    files = db.query(FileUpload).filter(FileUpload.user_id == user_id).order_by(FileUpload.uploaded_at.desc()).all()
    return files

@router.get("/{file_id}")
async def get_file_info(file_id: int, db: Session = Depends(get_db)):
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@router.get("/{file_id}/presigned")
async def get_presigned_url(file_id: int, db: Session = Depends(get_db)):
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    is_r2 = False
    if s3_client and settings.R2_BUCKET_NAME:
        if file.file_path and file.file_path[0].isdigit() and "uploads" not in file.file_path:
             is_r2 = True

    if is_r2:
        try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.R2_BUCKET_NAME, 'Key': file.file_path},
                ExpiresIn=3600
            )
            return {"url": url}
        except ClientError as e:
            raise HTTPException(status_code=500, detail="Failed to generate presigned URL")
    
    # If local, maybe return a download URL?
    # Or just raise error as this endpoint implies presigned (cloud) URL
    # But for compatibility, we can return the local download URL if it exists
    if os.path.exists(file.file_path):
         return {"url": f"{settings.API_V1_STR}/files/{file.id}/download"}

    raise HTTPException(status_code=400, detail="Not a cloud file")

@router.get("/{file_id}/download")
async def download_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Determine if file is likely in R2 or Local
    # R2 keys are typically "user_id/filename" (starting with digit)
    # Local paths are typically "uploads/filename"
    is_r2 = False
    if s3_client and settings.R2_BUCKET_NAME:
        # Check if it looks like an R2 key (starts with digit and has no "uploads")
        if file.file_path and file.file_path[0].isdigit() and "uploads" not in file.file_path:
             is_r2 = True

    if is_r2:
         try:
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.R2_BUCKET_NAME, 'Key': file.file_path},
                ExpiresIn=3600
            )
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url)
         except:
             pass
    
    # If local
    if os.path.exists(file.file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file.file_path, filename=file.file_name, media_type=file.mime_type)
        
    # If file_url is a full URL (e.g. from previous system)
    if file.file_url and file.file_url.startswith("http"):
        from fastapi.responses import RedirectResponse
        return RedirectResponse(file.file_url)

    raise HTTPException(status_code=404, detail="File content not found")


# Verify file endpoint
@router.put("/{file_id}/verify")
async def verify_file(
    file_id: int,
    is_verified: bool = Body(...),
    verified_by: Optional[int] = Body(None),
    verification_notes: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    # Get file info
    file_record = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get user info
    user = db.query(User).filter(User.id == file_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update file status
    file_record.is_verified = is_verified
    file_record.status = "Verified" if is_verified else "Pending"
    if verification_notes:
        file_record.verification_notes = verification_notes
    if verified_by:
        file_record.verified_by = verified_by
    
    db.commit()
    db.refresh(file_record)
    
    # Create notification for the user
    from app.models.notification import Notification, NotificationType
    notification = Notification(
        user_id=user.id,
        title="File Verification Status Updated",
        message=f"Your {file_record.file_type} has been {'verified' if is_verified else 'marked as unverified'}." + (f" Notes: {verification_notes}" if verification_notes else ""),
        sent_by=verified_by,
        notification_type=NotificationType.SYSTEM
    )
    
    db.add(notification)
    db.commit()
    
    return file_record


@router.put("/{file_id}/reject")
async def reject_file(file_id: int, reason: str = Body(...), db: Session = Depends(get_db)):
    # Get file info
    file_record = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Get user info
    user = db.query(User).filter(User.id == file_record.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update file status
    file_record.is_verified = False
    file_record.status = "Rejected"
    if reason:
        file_record.verification_notes = reason
    
    db.commit()
    db.refresh(file_record)
    
    # Create notification for the user
    from app.models.notification import Notification, NotificationType
    notification = Notification(
        user_id=user.id,
        title="Resume Rejected",
        message=reason if reason else "Your resume was rejected.",
        sent_by=None,
        notification_type=NotificationType.PROFILE_REJECTED
    )
    
    db.add(notification)
    db.commit()
    
    return file_record
