# Models package
from app.models.user import User, Profile, UserRole
from app.models.resume import Resume
from app.models.certificate import Certificate
from app.models.job import Job, JobApplication, ApplicationStatus
from app.models.event import Event, EventRegistration
from app.models.file import FileUpload
from app.models.notification import Notification, NotificationType

__all__ = [
    "User",
    "Profile",
    "UserRole",
    "Resume",
    "Certificate",
    "Job",
    "JobApplication",
    "ApplicationStatus",
    "Event",
    "EventRegistration",
    "FileUpload",
    "Notification",
    "NotificationType",
]