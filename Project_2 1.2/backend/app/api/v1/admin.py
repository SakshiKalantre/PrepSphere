from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.job import Job
from app.models.event import Event
from app.models.file import FileUpload

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

router = APIRouter()

# Removed duplicate /admin/analytics endpoint to avoid routing conflicts

@router.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    """Get all users for manage users section"""
    users = db.query(User).all()
    
    result = []
    for user in users:
        # Handle role enum conversion gracefully
        try:
            role_value = user.role.value
        except:
            # If enum conversion fails, use the raw value and convert to uppercase
            role_value = getattr(user, 'role', 'STUDENT').upper()
            if role_value not in ['STUDENT', 'TPO', 'ADMIN']:
                role_value = 'STUDENT'
        
        # Check for uploaded and verified resume
        from app.models.file import FileUpload
        resume = db.query(FileUpload).filter(
            FileUpload.user_id == user.id,
            FileUpload.file_type == 'resume',
            FileUpload.is_verified == True
        ).first()
        
        # Check for uploaded offer letter (regardless of verification status)
        offer_letter = db.query(FileUpload).filter(
            FileUpload.user_id == user.id,
            FileUpload.file_type == 'offer_letter'
        ).first()
        
        # Get user's profile if exists
        profile = user.profile if hasattr(user, 'profile') and user.profile else None
        
        user_info = {
            "id": user.id,
            "name": f"{user.first_name or ''} {user.last_name or ''}".strip(),
            "email": user.email,
            "role": role_value,
            "status": "Active" if user.is_active else "Inactive",
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "has_verified_resume": resume is not None,
            "has_verified_offer_letter": offer_letter is not None,
            "resume_file_id": resume.id if resume else None,
            "offer_letter_file_id": offer_letter.id if offer_letter else None,
        }
        
        if profile:
            user_info.update({
                "profile": {
                    "phone": profile.phone,
                    "degree": profile.degree,
                    "year": profile.year,
                    "skills": profile.skills,
                    "about": profile.about,
                    "profile_image_url": profile.profile_image_url,
                    "alternate_email": profile.alternate_email,
                    "placement_status": profile.placement_status,
                    "approval_status": profile.approval_status,
                    "company_name": profile.company_name,
                    "offer_letter_url": profile.offer_letter_url,
                    "profile_is_approved": profile.is_approved,
                    "approval_notes": profile.approval_notes,
                    "profile_created_at": profile.created_at.isoformat() if profile.created_at else None,
                    "profile_updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
                }
            })
        
        result.append(user_info)
    
    return result


@router.get("/admin/students")
def get_all_students(db: Session = Depends(get_db)):
    """Get all students with their profile information and placement status"""
    # Query for students using string comparison to avoid enum issues
    students = db.query(User).filter(User.role.like('%STUDENT%') | (func.upper(User.role) == 'STUDENT')).all()
    
    result = []
    for student in students:
        # Handle role enum conversion gracefully
        try:
            role_value = student.role.value
        except:
            # If enum conversion fails, use the raw value and convert to uppercase
            role_value = getattr(student, 'role', 'STUDENT').upper()
            if role_value not in ['STUDENT', 'TPO', 'ADMIN']:
                role_value = 'STUDENT'
        
        # Get student's profile
        profile = student.profile if hasattr(student, 'profile') and student.profile else None
        
        # Check for uploaded and verified resume
        resume = None
        if profile:
            from app.models.file import FileUpload
            resume = db.query(FileUpload).filter(
                FileUpload.user_id == student.id,
                FileUpload.file_type == 'resume',
                FileUpload.is_verified == True
            ).first()
        
        # Check for uploaded offer letter (regardless of verification status)
        offer_letter = None
        if profile:
            from app.models.file import FileUpload
            offer_letter = db.query(FileUpload).filter(
                FileUpload.user_id == student.id,
                FileUpload.file_type == 'offer_letter'
            ).first()
        
        student_info = {
            "id": student.id,
            "name": f"{student.first_name or ''} {student.last_name or ''}".strip(),
            "email": student.email,
            "phone_number": student.phone_number,
            "status": "Active" if student.is_active else "Inactive",
            "profile_complete": student.profile_complete,
            "is_approved": student.is_approved,
            "created_at": student.created_at.isoformat() if student.created_at else None,
            "role": role_value,
            "placement_status": profile.placement_status if profile else "Not Placed",
            "company_name": profile.company_name if profile else None,
            "approval_status": profile.approval_status if profile else "Pending",
            "degree": profile.degree if profile else None,
            "year": profile.year if profile else None,
            "skills": profile.skills if profile else None,
            "about": profile.about if profile else None,
            "has_verified_resume": resume is not None,
            "has_verified_offer_letter": offer_letter is not None,
            "resume_file_id": resume.id if resume else None,
            "offer_letter_file_id": offer_letter.id if offer_letter else None,
        }
        result.append(student_info)
    
    return result


@router.get("/admin/tpos")
def get_all_tpos(db: Session = Depends(get_db)):
    """Get all TPO users with basic information"""
    # Query for TPOs using string comparison to avoid enum issues
    tpos = db.query(User).filter(User.role.like('%TPO%') | (func.upper(User.role) == 'TPO')).all()
    
    result = []
    for tpo in tpos:
        # Handle role enum conversion gracefully
        try:
            role_value = tpo.role.value
        except:
            # If enum conversion fails, use the raw value and convert to uppercase
            role_value = getattr(tpo, 'role', 'STUDENT').upper()
            if role_value not in ['STUDENT', 'TPO', 'ADMIN']:
                role_value = 'TPO'
        
        # Check for uploaded and verified resume for TPO (if applicable)
        from app.models.file import FileUpload
        resume = db.query(FileUpload).filter(
            FileUpload.user_id == tpo.id,
            FileUpload.file_type == 'resume',
            FileUpload.is_verified == True
        ).first()
        
        # Check for uploaded offer letter for TPO (regardless of verification status)
        offer_letter = db.query(FileUpload).filter(
            FileUpload.user_id == tpo.id,
            FileUpload.file_type == 'offer_letter'
        ).first()
        
        tpo_info = {
            "id": tpo.id,
            "name": f"{tpo.first_name or ''} {tpo.last_name or ''}".strip(),
            "email": tpo.email,
            "phone_number": tpo.phone_number,
            "status": "Active" if tpo.is_active else "Inactive",
            "is_approved": tpo.is_approved,
            "created_at": tpo.created_at.isoformat() if tpo.created_at else None,
            "role": role_value,
            "has_verified_resume": resume is not None,
            "has_verified_offer_letter": offer_letter is not None,
            "resume_file_id": resume.id if resume else None,
            "offer_letter_file_id": offer_letter.id if offer_letter else None,
        }
        result.append(tpo_info)
    
    return result


@router.get("/admin/user/{user_id}")
def get_user_details(user_id: int, db: Session = Depends(get_db)):
    """Get detailed information for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's profile
    profile = user.profile if hasattr(user, 'profile') and user.profile else None
    
    user_info = {
        "id": user.id,
        "clerk_user_id": user.clerk_user_id,
        "name": f"{user.first_name or ''} {user.last_name or ''}".strip(),
        "email": user.email,
        "role": user.role.value,
        "phone_number": user.phone_number,
        "status": "Active" if user.is_active else "Inactive",
        "profile_complete": user.profile_complete,
        "is_approved": user.is_approved,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }
    
    if profile:
        user_info.update({
            "profile": {
                "phone": profile.phone,
                "degree": profile.degree,
                "year": profile.year,
                "skills": profile.skills,
                "about": profile.about,
                "profile_image_url": profile.profile_image_url,
                "alternate_email": profile.alternate_email,
                "placement_status": profile.placement_status,
                "approval_status": profile.approval_status,
                "company_name": profile.company_name,
                "offer_letter_url": profile.offer_letter_url,
                "profile_is_approved": profile.is_approved,
                "approval_notes": profile.approval_notes,
                "profile_created_at": profile.created_at.isoformat() if profile.created_at else None,
                "profile_updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
            }
        })
    
    return user_info


@router.put("/admin/user/{user_id}/approve")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    """Approve a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_approved = True
    db.commit()
    db.refresh(user)
    
    return {"message": "User approved successfully", "user_id": user.id, "is_approved": user.is_approved}



@router.put("/admin/user/{user_id}/reject")
def reject_user(user_id: int, db: Session = Depends(get_db)):
    """Reject a user account"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_approved = False
    db.commit()
    db.refresh(user)
    
    return {"message": "User rejection status updated", "user_id": user.id, "is_approved": user.is_approved}


from pydantic import BaseModel


class CreateUserRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone_number: str
    role: str
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "student@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "phone_number": "+1234567890",
                "role": "STUDENT",
                "password": "securepassword"
            }
        }

class SendNotificationRequest(BaseModel):
    user_id: int
    message: str
    title: str = "Admin Message"


@router.post("/admin/create-user")
def create_user(
    user_data: CreateUserRequest,
    db: Session = Depends(get_db)
):
    """Create a new user"""
    from app.models.user import User, UserRole
    from app.core.config import settings
    from werkzeug.security import generate_password_hash
    import secrets
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Generate a unique user ID
    clerk_user_id = f"admin_created_{secrets.token_hex(8)}"
    
    # Normalize role to uppercase
    role_upper = user_data.role.upper()
    if role_upper not in ['STUDENT', 'TPO', 'ADMIN']:
        role_upper = 'STUDENT'
    
    # Create new user
    db_user = User(
        clerk_user_id=clerk_user_id,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        role=role_upper,
        hashed_password=generate_password_hash(user_data.password),
        is_approved=True  # Auto-approve users created by admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "email": db_user.email,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "role": db_user.role.value,
        "message": "User created successfully"
    }


@router.post("/admin/send-notification")
def send_notification_to_user(
    request: SendNotificationRequest,
    db: Session = Depends(get_db)
):
    """Send a notification to a specific user"""
    from app.models.notification import Notification
    from app.models.user import User
    
    # Get the user to notify
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create notification
    notification = Notification(
        user_id=user.id,
        title=f"Admin: {request.title}",
        message=f"From Admin: {request.message}",
        notification_type="SYSTEM"  # Default type for admin messages
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return {"message": "Notification sent successfully", "notification_id": notification.id}


@router.put("/admin/user/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db)):
    """Activate a user account"""
    from app.models.user import User
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User activated successfully", 
        "user_id": user.id, 
        "is_active": user.is_active,
        "status": "Active" if user.is_active else "Inactive"
    }


@router.put("/admin/user/{user_id}/deactivate")
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    """Deactivate a user account"""
    from app.models.user import User
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User deactivated successfully", 
        "user_id": user.id, 
        "is_active": user.is_active,
        "status": "Active" if user.is_active else "Inactive"
    }


# CSV export functionality
from fastapi.responses import StreamingResponse
from io import StringIO
import csv


@router.get("/admin/export-users")
def export_users_csv(db: Session = Depends(get_db)):
    """Export all users data to CSV format"""
    users = db.query(User).all()
    
    # Create a StringIO object to write CSV data
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header row
    writer.writerow([
        "ID", "Email", "First Name", "Last Name", "Phone Number", 
        "Role", "Status", "Profile Complete", "Approved", "Created At"
    ])
    
    # Write data rows
    for user in users:
        writer.writerow([
            user.id,
            user.email,
            user.first_name,
            user.last_name,
            user.phone_number,
            user.role.value if hasattr(user.role, 'value') else user.role,
            "Active" if user.is_active else "Inactive",
            "Yes" if user.profile_complete else "No",
            "Yes" if user.is_approved else "No",
            user.created_at.isoformat() if user.created_at else None
        ])
    
    # Get the CSV content
    csv_content = output.getvalue()
    output.close()
    
    # Create a streaming response
    def generate():
        yield csv_content.encode('utf-8')
    
    return StreamingResponse(generate(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=users_export.csv"})


@router.get("/admin/pending-certificates")
def get_pending_certificates(db: Session = Depends(get_db)): 
    """Get pending certificates for verification (already exists in files endpoint)"""
    certificates = db.query(FileUpload).filter(
        FileUpload.file_type.in_(['certificate', 'offer_letter']),
        FileUpload.is_verified == False
    ).all()
    
    result = []
    for cert in certificates:
        user = db.query(User).filter(User.id == cert.user_id).first()
        if user:
            result.append({
                "id": cert.id,
                "file_name": cert.file_name,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "file_type": cert.file_type,
                "uploaded_at": cert.uploaded_at.isoformat() if cert.uploaded_at else None
            })
    
    return result


@router.get("/admin/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Get comprehensive analytics data for the admin dashboard"""
    from app.models.user import User, Profile
    from app.models.job import Job
    from app.models.event import Event
    from app.models.notification import Notification
    from sqlalchemy import func
    
    # Total Users
    total_users = db.query(User).count()
    
    # Total Students and TPOs
    total_students = db.query(User).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT')
    ).count()
    
    total_tpos = db.query(User).filter(
        (User.role == 'TPO') | (func.upper(User.role) == 'TPO')
    ).count()
    
    # Placed vs Unplaced Students (based on offer letter upload)
    from app.models.file import FileUpload
    
    # Students who have uploaded offer letters (regardless of verification)
    placed_students_subquery = db.query(FileUpload.user_id).filter(
        FileUpload.file_type == 'offer_letter'
    ).subquery()
    
    placed_students = db.query(User).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        User.id.in_(placed_students_subquery)
    ).count()
    
    # Students who have NOT uploaded offer letters
    unplaced_students = total_students - placed_students
    
    # Active vs Inactive Jobs
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    inactive_jobs = total_jobs - active_jobs
    
    # Total Applications
    total_applications = db.query(Notification).filter(
        Notification.notification_type == 'APPLICATION_UPDATE'
    ).count()
    
    # Total Events and Registrations
    total_events = db.query(Event).count()
    
    # Count events by status
    upcoming_events = db.query(Event).filter(Event.status == 'Upcoming').count()
    completed_events = db.query(Event).filter(Event.status == 'Completed').count()
    cancelled_events = db.query(Event).filter(Event.status == 'Cancelled').count()
    
    # Count registrations for events
    from app.models.event import EventRegistration
    total_registrations = db.query(EventRegistration).count()
    
    # Calculate placement percentage
    placement_percentage = 0
    if total_students > 0:
        placement_percentage = round((placed_students / total_students) * 100, 2)
    
    # Active vs Inactive Users
    active_users = db.query(User).filter(User.is_active == True).count()
    inactive_users = total_users - active_users
    
    # Prepare analytics data
    analytics_data = {
        "totalUsers": total_users,
        "totalStudents": total_students,
        "totalTPO": total_tpos,
        "placedStudents": placed_students,
        "unplacedStudents": unplaced_students,
        "activeJobs": active_jobs,
        "inactiveJobs": inactive_jobs,
        "totalApplications": total_applications,
        "totalEvents": total_events,
        "upcomingEvents": upcoming_events,
        "completedEvents": completed_events,
        "cancelledEvents": cancelled_events,
        "totalRegistrations": total_registrations,
        "placementPercentage": placement_percentage,
        "totalJobs": total_jobs,
        "activeUsers": active_users,
        "inactiveUsers": inactive_users,
    }
    
    return analytics_data


@router.get("/admin/analytics/report")
def get_analytics_report(db: Session = Depends(get_db)):
    """Generate a PDF report of the analytics data"""
    from fastapi.responses import StreamingResponse
    import io
    from datetime import datetime
    import traceback
    
    if not REPORTLAB_AVAILABLE:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="ReportLab is not installed")
    
    try:
        # Get the analytics data
        analytics_data = get_analytics(db)
        
        # Create a PDF in memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Title
        c.setFont("Helvetica-Bold", 20)
        title_text = 'Admin Analytics Report'
        title_width = c.stringWidth(title_text, "Helvetica-Bold", 20)
        c.drawString((width - title_width) / 2.0, height - 50, title_text)
        
        # Date
        c.setFont("Helvetica", 12)
        date_str = f'Report Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        date_width = c.stringWidth(date_str, "Helvetica", 12)
        c.drawString((width - date_width) / 2.0, height - 70, date_str)
        
        # Start position for content
        y_position = height - 100
        
        # Main Analytics Section
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, 'Main Analytics')
        y_position -= 30
        
        # User counts
        c.setFont("Helvetica", 12)
        c.drawString(70, y_position, f'Total Users: {analytics_data["totalUsers"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Total Students: {analytics_data["totalStudents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Total TPOs: {analytics_data["totalTPO"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Active Users: {analytics_data["activeUsers"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Inactive Users: {analytics_data["inactiveUsers"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Placed Students: {analytics_data["placedStudents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Unplaced Students: {analytics_data["unplacedStudents"]}')
        y_position -= 30
        
        # Job Analytics Section
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, 'Job Analytics')
        y_position -= 30
        
        c.setFont("Helvetica", 12)
        c.drawString(70, y_position, f'Active Jobs: {analytics_data["activeJobs"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Inactive Jobs: {analytics_data["inactiveJobs"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Total Jobs: {analytics_data["totalJobs"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Total Applications: {analytics_data["totalApplications"]}')
        y_position -= 30
        
        # Event Analytics Section
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y_position, 'Event Analytics')
        y_position -= 30
        
        c.setFont("Helvetica", 12)
        c.drawString(70, y_position, f'Total Events: {analytics_data["totalEvents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Upcoming Events: {analytics_data["upcomingEvents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Completed Events: {analytics_data["completedEvents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Cancelled Events: {analytics_data["cancelledEvents"]}')
        y_position -= 20
        c.drawString(70, y_position, f'Total Event Registrations: {analytics_data["totalRegistrations"]}')
        
        # Add placement percentage
        y_position -= 30
        c.drawString(70, y_position, f'Overall Placement Percentage: {analytics_data["placementPercentage"]}%')
        
        # Finalize the PDF
        c.showPage()
        c.save()
        
        # Get the PDF data
        buffer.seek(0)
        
        # Return as streaming response
        return StreamingResponse(buffer, media_type='application/pdf', headers={'Content-Disposition': 'attachment; filename=admin-analytics-report.pdf'})
    except Exception as e:
        # Log the error for debugging
        error_msg = f"Error generating PDF: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error generating PDF report: {str(e)}")


@router.get("/admin/analytics/report-text")
def get_analytics_report_text(db: Session = Depends(get_db)):
    """Generate a text report of the analytics data"""
    from fastapi.responses import StreamingResponse
    import io
    from datetime import datetime
    
    try:
        # Get the analytics data
        analytics_data = get_analytics(db)
        
        # Create a text report
        report_content = []
        report_content.append("Admin Analytics Report")
        report_content.append("=" * 50)
        report_content.append(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_content.append("")
        
        # Main Analytics Section
        report_content.append("MAIN ANALYTICS")
        report_content.append("-" * 30)
        report_content.append(f"Total Users: {analytics_data['totalUsers']}")
        report_content.append(f"Total Students: {analytics_data['totalStudents']}")
        report_content.append(f"Total TPOs: {analytics_data['totalTPO']}")
        report_content.append(f"Active Users: {analytics_data['activeUsers']}")
        report_content.append(f"Inactive Users: {analytics_data['inactiveUsers']}")
        report_content.append(f"Placed Students: {analytics_data['placedStudents']}")
        report_content.append(f"Unplaced Students: {analytics_data['unplacedStudents']}")
        report_content.append("")
        
        # Job Analytics Section
        report_content.append("JOB ANALYTICS")
        report_content.append("-" * 30)
        report_content.append(f"Active Jobs: {analytics_data['activeJobs']}")
        report_content.append(f"Inactive Jobs: {analytics_data['inactiveJobs']}")
        report_content.append(f"Total Jobs: {analytics_data['totalJobs']}")
        report_content.append(f"Total Applications: {analytics_data['totalApplications']}")
        report_content.append("")
        
        # Event Analytics Section
        report_content.append("EVENT ANALYTICS")
        report_content.append("-" * 30)
        report_content.append(f"Total Events: {analytics_data['totalEvents']}")
        report_content.append(f"Upcoming Events: {analytics_data['upcomingEvents']}")
        report_content.append(f"Completed Events: {analytics_data['completedEvents']}")
        report_content.append(f"Cancelled Events: {analytics_data['cancelledEvents']}")
        report_content.append(f"Total Event Registrations: {analytics_data['totalRegistrations']}")
        report_content.append(f"Overall Placement Percentage: {analytics_data['placementPercentage']}%")
        report_content.append("")
        
        # Join all content
        content = "\n".join(report_content)
        
        # Create a BytesIO stream
        buffer = io.BytesIO(content.encode('utf-8'))
        
        # Return as streaming response
        return StreamingResponse(buffer, media_type='text/plain', headers={'Content-Disposition': 'attachment; filename=admin-analytics-report.txt'})
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error generating text report: {str(e)}")
