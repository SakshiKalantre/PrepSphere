# PrepSphere Database Schema

## Database Configuration

**Database System**: PostgreSQL (Compatible with Neon DB)
**Connection URL Pattern**: `postgresql://<user>:<password>@<host>:<port>/<database>`

To configure the database, ensure your `.env` file in the backend directory contains the `DATABASE_URL` variable.

Example for Neon DB:
```env
DATABASE_URL=postgresql://neondb_owner:npg_SIX1McwNmVA0@ep-bitter-queen-a7zgtwri-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Tables Schema

### 1. **users**
Core table for storing user account information.
- `id` (Integer, Primary Key)
- `clerk_user_id` (String, Unique) - Authentication ID from Clerk
- `email` (String, Unique)
- `first_name` (String)
- `last_name` (String)
- `phone_number` (String, Optional)
- `role` (Enum: STUDENT, TPO, ADMIN) - Default: STUDENT
- `is_active` (Boolean) - Default: True
- `is_verified` (Boolean) - Default: False
- `verification_token` (String, Optional)
- `is_approved` (Boolean) - For TPO/Admin approval status
- `profile_complete` (Boolean) - Default: False
- `hashed_password` (String, Optional) - For local auth
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 2. **profiles**
Extended profile details for users (primarily students).
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id, Unique)
- `phone` (String, Optional)
- `full_name` (String, Optional)
- `degree` (String, Optional)
- `year` (String, Optional)
- `skills` (Text, Optional)
- `about` (Text, Optional)
- `profile_image_url` (String, Optional)
- `alternate_email` (String, Optional)
- `placement_status` (String) - Default: 'Not Placed'
- `approval_status` (String) - Default: 'Pending'
- `company_name` (String, Optional)
- `offer_letter_url` (String, Optional)
- `unplaced_reason` (String, Optional)
- `custom_reason_text` (Text, Optional)
- `has_uploaded_documents` (Boolean) - Default: False
- `is_approved` (Boolean) - Default: False
- `approval_notes` (Text, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 3. **password_reset_tokens**
Tokens for password reset functionality.
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id)
- `token` (String, Unique)
- `expires_at` (DateTime)
- `used` (Boolean) - Default: False
- `created_at` (DateTime)

### 4. **jobs**
Job postings created by TPOs.
- `id` (Integer, Primary Key)
- `title` (String)
- `company` (String)
- `location` (String)
- `description` (Text)
- `requirements` (Text)
- `salary_range` (String, Optional)
- `salary` (String, Optional)
- `job_type` (String, Optional)
- `type` (String, Optional)
- `application_deadline` (DateTime, Optional)
- `is_active` (Boolean) - Default: True
- `created_by` (Integer, Foreign Key -> users.id)
- `total_positions` (Integer) - Default: 1
- `job_url` (String, Optional)
- `status` (String) - Default: "Active"
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 5. **job_applications**
Records of students applying to jobs.
- `id` (Integer, Primary Key)
- `job_id` (Integer, Foreign Key -> jobs.id)
- `user_id` (Integer, Foreign Key -> users.id)
- `resume_id` (Integer, Foreign Key -> resumes.id, Optional)
- `cover_letter` (Text, Optional)
- `status` (Enum: PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN) - Default: PENDING
- `interview_scheduled` (Boolean) - Default: False
- `interview_date` (DateTime, Optional)
- `interview_notes` (Text, Optional)
- `applied_at` (DateTime)
- `updated_at` (DateTime)

### 6. **analytics_percentages**
Stored placement analytics data.
- `id` (Integer, Primary Key)
- `placed_percentage` (Numeric)
- `unplaced_percentage` (Numeric)
- `higher_studies_percentage` (Numeric)
- `exploring_percentage` (Numeric)
- `others_percentage` (Numeric)
- `placement_rate_percentage` (Numeric)
- `total_students` (Integer)
- `placed_students` (Integer)
- `unplaced_students` (Integer)
- `higher_studies_count` (Integer)
- `exploring_count` (Integer)
- `others_count` (Integer)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 7. **events**
Events, workshops, and seminars.
- `id` (Integer, Primary Key)
- `title` (String)
- `description` (Text)
- `location` (String)
- `event_date` (DateTime)
- `event_time` (String)
- `status` (String) - Default: "Upcoming"
- `event_type` (String, Optional)
- `capacity` (Integer, Optional)
- `registered_count` (Integer) - Default: 0
- `is_active` (Boolean) - Default: True
- `is_online` (Boolean) - Default: False
- `meeting_link` (String, Optional)
- `form_url` (String, Optional)
- `category` (String, Optional)
- `created_by` (Integer, Foreign Key -> users.id)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 8. **event_registrations**
Student registrations for events.
- `id` (Integer, Primary Key)
- `event_id` (Integer, Foreign Key -> events.id)
- `user_id` (Integer, Foreign Key -> users.id)
- `registration_status` (String) - Default: "registered"
- `registered_at` (DateTime)
- `attended_at` (DateTime, Optional)

### 9. **notifications**
System and user notifications.
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id)
- `title` (String)
- `message` (Text)
- `notification_type` (Enum: JOB_ALERT, APPLICATION_UPDATE, etc.)
- `is_read` (Boolean) - Default: False
- `related_id` (Integer, Optional)
- `related_type` (String, Optional)
- `created_at` (DateTime)
- `read_at` (DateTime, Optional)
- `sent_by` (Integer, Foreign Key -> users.id, Optional)

### 10. **contact_messages**
Messages from the contact form.
- `id` (Integer, Primary Key)
- `name` (String)
- `company_name` (String, Optional)
- `designation` (String, Optional)
- `official_website` (String, Optional)
- `phone_number` (String, Optional)
- `email` (String)
- `message` (Text)
- `is_read` (Boolean) - Default: False
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 11. **file_uploads**
Generic file upload tracking.
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id)
- `file_name` (String)
- `file_path` (String)
- `file_size` (BigInteger)
- `mime_type` (String)
- `file_type` (String)
- `file_url` (String, Optional)
- `file_hash` (String, Optional)
- `is_verified` (Boolean) - Default: False
- `verified_by` (Integer, Optional)
- `verification_notes` (Text, Optional)
- `status` (String) - Default: 'Pending'
- `uploaded_at` (DateTime)

### 12. **certificates**
Student certifications.
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id)
- `title` (String)
- `issuer` (String)
- `issue_date` (DateTime)
- `expiry_date` (DateTime, Optional)
- `credential_url` (String, Optional)
- `description` (Text, Optional)
- `file_url` (String, Optional)
- `is_verified` (Boolean) - Default: False
- `verified_by` (Integer, Foreign Key -> users.id, Optional)
- `verification_notes` (Text, Optional)
- `uploaded_at` (DateTime)
- `verified_at` (DateTime, Optional)

### 13. **resumes**
Student resume files.
- `id` (Integer, Primary Key)
- `user_id` (Integer, Foreign Key -> users.id)
- `filename` (String)
- `file_url` (String)
- `is_primary` (Boolean) - Default: False
- `is_verified` (Boolean) - Default: False
- `verified_by` (Integer, Foreign Key -> users.id, Optional)
- `verification_notes` (Text, Optional)
- `uploaded_at` (DateTime)
- `verified_at` (DateTime, Optional)

## Email Configuration

The application includes SMTP email functionality managed in `backend/app/api/v1/users.py`:
- SMTP Host: smtp.gmail.com
- SMTP Port: 587
- SMTP User: maneswapnil.0406@gmail.com
- SMTP Password: glvuhgbcsqjqnkvk

This configuration is used for:
- Account verification emails
- Password reset emails

## File Storage Configuration

The application supports multiple file storage options:
- Primary: Cloudflare R2 (S3-compatible object storage)
- Fallback: Local filesystem storage (uploads directory)

Cloudflare R2 configuration in `.env`:
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_ACCOUNT_ID
- R2_BUCKET_NAME
- R2_ENDPOINT
