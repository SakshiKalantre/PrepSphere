from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.db.session import get_db
from app.models.user import User, UserRole, Profile
from app.models.job import Job, JobApplication
from app.models.event import Event, EventRegistration
from app.models.notification import Notification, NotificationType
from app.models.file import FileUpload

router = APIRouter()

@router.get("/public/stats")
def get_public_stats(db: Session = Depends(get_db)):
    """Public endpoint to get general statistics for the homepage"""
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()  # Count only active jobs
    total_applications = db.query(JobApplication).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    
    # Count placed students (those with placement_status='Placed')
    total_placed = db.query(Profile).filter(Profile.placement_status == 'Placed').count()
    
    # Calculate selected (hired) applications if applicable, or use placement count
    total_selected = total_placed 
    
    # Get top applications by job (for the achievements section)
    top_jobs = db.query(
        Job, 
        func.count(JobApplication.id).label('application_count')
    ).join(JobApplication, Job.id == JobApplication.job_id).filter(Job.is_active == True).group_by(Job.id).order_by(
        func.count(JobApplication.id).desc()
    ).limit(5).all()
    
    applications_by_job = []
    for job, count in top_jobs:
        applications_by_job.append({
            "title": job.title,
            "company": job.company,  # Changed from company_name to company
            "applications": count
        })
    
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,  # Added active job count
        "total_applications": total_applications,
        "total_selected": total_selected,
        "total_students": total_students,
        "total_placed": total_placed,
        "applications_by_job": applications_by_job
    }


@router.get("/stats/placement-breakdown")
def get_placement_breakdown(db: Session = Depends(get_db)):
    """Public endpoint to get placement breakdown by company"""
    # Get placement data grouped by company
    placement_data = db.query(
        Profile.company_name,
        func.count(Profile.id).label('count')
    ).filter(
        Profile.placement_status == 'Placed',
        Profile.company_name.isnot(None)
    ).group_by(Profile.company_name).order_by(
        func.count(Profile.id).desc()
    ).limit(10).all()
    
    result = []
    for company_name, count in placement_data:
        result.append({
            "company_name": company_name,
            "count": count
        })
    
    return result


@router.get("/stats/placement-percentage-by-year")
def get_placement_percentage_by_year(db: Session = Depends(get_db)):
    """Public endpoint to get placement percentage by academic year"""
    # Get placement data grouped by year
    placement_data = db.query(
        Profile.year,
        func.count(Profile.id).label('total'),
        func.sum(func.cast(Profile.placement_status == 'Placed', db.Integer)).label('placed')
    ).filter(
        Profile.year.isnot(None)
    ).group_by(Profile.year).all()
    
    result = []
    for year, total, placed in placement_data:
        if total > 0:
            percentage = round((placed / total) * 100) if placed and total else 0
            result.append({
                "year": str(year),
                "percentage": percentage
            })
    
    # Ensure we have data for years 2023-2028
    years_present = {item['year'] for item in result}
    for year in ['2023', '2024', '2025', '2026', '2027', '2028']:
        if year not in years_present:
            result.append({
                "year": year,
                "percentage": 0
            })
    
    # Sort by year
    result.sort(key=lambda x: x['year'])
    
    return result