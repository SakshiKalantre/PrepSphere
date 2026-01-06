# PrepSphere Database Schema

## Database Configuration
**Database URL**: `postgresql://user:Swapnil%402102@localhost:5432/Project_2`

## Tables Created

### 1. **users** (Core user table)
- `id` (Integer, PK)
- `clerk_user_id` (String, Unique) - Clerk authentication ID
- `email` (String, Unique) - User email
- `first_name` (String) - First name
- `last_name` (String) - Last name
- `phone_number` (String, Optional) - Phone number
- `role` (Enum) - UserRole (student, tpo, admin)
- `is_active` (Boolean) - Account active status
- `is_approved` (Boolean) - Approval status (for TPO/Admin)
- `profile_complete` (Boolean) - Profile completion status
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### 2. **profiles** (User profile details)
- `id` (Integer, PK)
- `user_id` (Integer, FK) - Reference to users table
- `phone` (String, Optional)
- `degree` (String, Optional) - Academic degree
- `year` (String, Optional) - Current year of study
- `skills` (Text, Optional) - Comma-separated skills
- `about` (Text, Optional) - Bio/About section
- `profile_image_url` (String, Optional) - Profile picture URL
- `is_approved` (Boolean) - Profile approval status
- `approval_notes` (Text, Optional) - Notes from TPO approval
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 3. **resumes** (Student resumes)
- `id` (Integer, PK)
- `user_id` (Integer, FK) - Reference to users table
- `filename` (String) - Original filename
- `file_url` (String) - Path to resume file
- `is_primary` (Boolean) - Primary resume for job applications
- `is_verified` (Boolean) - TPO verification status
- `verified_by` (Integer, FK, Optional) - TPO user ID who verified
- `verification_notes` (Text, Optional)
- `uploaded_at` (DateTime)
- `verified_at` (DateTime, Optional)

### 4. **certificates** (Student certifications)
- `id` (Integer, PK)
- `user_id` (Integer, FK)
- `title` (String) - Certificate name
- `issuer` (String) - Issuing organization
- `issue_date` (DateTime)
- `expiry_date` (DateTime, Optional)
- `credential_url` (String, Optional) - Link to credential
- `description` (Text, Optional)
- `file_url` (String, Optional) - Certificate file/image
- `is_verified` (Boolean) - TPO verification status
- `verified_by` (Integer, FK, Optional)
- `verification_notes` (Text, Optional)
- `uploaded_at` (DateTime)
- `verified_at` (DateTime, Optional)

### 5. **jobs** (Job postings by recruiters/TPO)
- `id` (Integer, PK)
- `title` (String) - Job title
- `company` (String) - Company name
- `location` (String) - Job location
- `description` (Text) - Job description
- `requirements` (Text) - Job requirements
- `salary_range` (String, Optional) - Salary range
- `job_type` (String, Optional) - Full-time, Internship, etc.
- `application_deadline` (DateTime, Optional)
- `is_active` (Boolean) - Job active status
- `created_by` (Integer, FK) - TPO user ID
- `total_positions` (Integer) - Number of positions
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 6. **job_applications** (Student job applications)
- `id` (Integer, PK)
- `job_id` (Integer, FK) - Reference to jobs
- `user_id` (Integer, FK) - Student who applied
- `resume_id` (Integer, FK, Optional) - Resume used for application
- `cover_letter` (Text, Optional)
- `status` (Enum) - pending, reviewed, shortlisted, accepted, rejected, withdrawn
- `interview_scheduled` (Boolean)
- `interview_date` (DateTime, Optional)
- `interview_notes` (Text, Optional)
- `applied_at` (DateTime)
- `updated_at` (DateTime)

### 7. **events** (Campus events and workshops)
- `id` (Integer, PK)
- `title` (String) - Event title
- `description` (Text)
- `location` (String)
- `event_date` (DateTime)
- `event_time` (String)
- `event_type` (String, Optional) - workshop, interview, seminar, etc.
- `capacity` (Integer, Optional) - Max participants
- `registered_count` (Integer) - Current registrations
- `is_active` (Boolean)
- `is_online` (Boolean) - Online event flag
- `meeting_link` (String, Optional) - Zoom/Meet link
- `created_by` (Integer, FK) - TPO user ID
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 8. **event_registrations** (Student event registrations)
- `id` (Integer, PK)
- `event_id` (Integer, FK) - Reference to events
- `user_id` (Integer, FK) - Student registered
- `registration_status` (String) - registered, attended, cancelled
- `registered_at` (DateTime)
- `attended_at` (DateTime, Optional)

### 9. **file_uploads** (General file uploads)
- `id` (Integer, PK)
- `user_id` (Integer, FK) - User who uploaded
- `file_name` (String) - Original filename
- `file_path` (String) - S3/Server path
- `file_size` (BigInteger) - File size in bytes
- `mime_type` (String) - File MIME type
- `file_type` (String) - resume, certificate, document, etc.
- `uploaded_at` (DateTime)

### 10. **notifications** (System notifications)
- `id` (Integer, PK)
- `user_id` (Integer, FK) - Recipient user
- `title` (String) - Notification title
- `message` (Text) - Notification message
- `notification_type` (Enum) - job_alert, application_update, interview_scheduled, event_reminder, profile_approved, profile_rejected, system
- `is_read` (Boolean)
- `related_id` (Integer, Optional) - Reference to related object (job, application, etc.)
- `related_type` (String, Optional) - Type of related object
- `created_at` (DateTime)
- `read_at` (DateTime, Optional)

## User Roles

1. **STUDENT** - Students who register for placements
   - Can upload resume, certificates, apply for jobs, register for events
   - Auto-approved on account creation
   
2. **TPO** - Training & Placement Officer
   - Can manage job postings
   - Can approve/reject student profiles and documents
   - Can schedule interviews
   - Can create and manage events
   - Requires secret password: `Tpo@2025`
   - Requires admin approval
   
3. **ADMIN** - System administrator
   - Full access to all features
   - Can manage all users
   - Can approve TPO accounts
   - Requires secret password: `Admin@2025`

## Clerk Integration

The backend uses Clerk for authentication with the following features:

### Supported Social Sign-In Methods
- Google OAuth
- GitHub OAuth
- LinkedIn OAuth
- Email/Password

### Clerk Authentication Flow
1. Frontend handles Clerk sign-up/sign-in
2. Backend receives Clerk user token
3. Backend verifies token with Clerk API
4. User is synced with database if new
5. Role is assigned based on sign-up choice

### Configuration
- Site Key: `6LfpQR8sAAAAAAobkCurmWSGgJQE9yMCcR08OwpE` (reCAPTCHA)
- Secret Key: Stored in .env file
- API Endpoint: https://api.clerk.com/v1

## How to Initialize Database

### Option 1: Using init_db.py script
```bash
cd backend
python init_db.py
```

### Option 2: Automatic on app startup
The FastAPI app automatically creates tables on startup via the `create_tables()` function in main.py

### Option 3: Manual with SQLAlchemy
```python
from app.db.session import engine, Base
Base.metadata.create_all(bind=engine)
```

## Key Features

### For Students:
- User profiles with academic details
- Resume management (multiple resumes, one primary)
- Certificate/credential tracking
- Job search and applications
- Event registration
- Application status tracking

### For TPO Officers:
- Job posting management
- Student profile approval system
- Resume/certificate verification
- Interview scheduling
- Event/workshop management
- Applicant screening

### For Administrators:
- User management (activate/deactivate)
- TPO account approval
- System-wide analytics
- Database management

## Security Features

- Clerk-based authentication (no password storage)
- Role-based access control (RBAC)
- reCAPTCHA on sign-up and sign-in
- Secret passwords for TPO and Admin roles
- Profile approval workflow
- Document verification by TPO

## API Integration Points

Backend routes use the following pattern: `/api/v1/{resource}`

Key endpoints:
- `/api/v1/users` - User management
- `/api/v1/jobs` - Job postings
- `/api/v1/jobs/{id}/applications` - Job applications
- `/api/v1/events` - Campus events
- `/api/v1/resumes` - Resume management
- `/api/v1/certificates` - Certificate tracking
- `/api/v1/notifications` - Notifications
