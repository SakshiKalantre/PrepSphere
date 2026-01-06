## Database Setup Instructions

### Prerequisites
1. PostgreSQL installed and running
2. Database created: `Project_2`
3. User created with credentials: `user / Swapnil@2102`

### Step 1: Update Environment Variables

Verify `.env` file has the correct DATABASE_URL:
```
DATABASE_URL=postgresql://user:Swapnil%402102@localhost:5432/Project_2
```

### Step 2: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Initialize Database

Choose one method:

**Method 1: Using provided script**
```bash
python init_db.py
```

**Method 2: Run FastAPI app (auto-creates tables)**
```bash
uvicorn main:app --reload
```

The `create_tables()` function in `main.py` will automatically create all tables on startup.

### Step 4: Verify Database Tables

Connect to PostgreSQL and verify tables were created:

```sql
\dt  -- List all tables

-- You should see:
-- users
-- profiles
-- resumes
-- certificates
-- jobs
-- job_applications
-- events
-- event_registrations
-- file_uploads
-- notifications
```

### Clerk Authentication Setup

#### Frontend (Already Configured)
- Site Key: `6LfpQR8sAAAAAAobkCurmWSGgJQE9yMCcR08OwpE`
- reCAPTCHA integrated on sign-up and sign-in pages
- Social sign-in buttons for Google, GitHub, LinkedIn

#### Backend Configuration
1. Verify `.env` has Clerk secrets:
```
CLERK_SECRET_KEY=sk_test_6mZekood1lRbULaCRaZ4Z7r5DpLFSOC8TqXZAFSQyZ
CLERK_PUBLISHABLE_KEY=pk_test_YWRqdXN0ZWQtY291Z2FyLTIxLmNsZXJrLmFjY291bnRzLmRldiQ
```

2. Test Clerk integration with user sync:
```python
from app.core.clerk_auth import ClerkAuth
from app.models import UserRole

# Sync a user from Clerk
user = ClerkAuth.sync_user_with_db(
    clerk_user_id="user_xxx",
    email="student@example.com",
    first_name="John",
    last_name="Doe",
    role=UserRole.STUDENT
)
print(f"User created: {user.email}")
```

### Testing the Setup

#### Test 1: User Creation
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "clerk_user_id": "user_123",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }'
```

#### Test 2: Database Connection
```bash
python
>>> from app.db.session import SessionLocal
>>> db = SessionLocal()
>>> from app.models import User
>>> users = db.query(User).all()
>>> print(f"Found {len(users)} users")
```

#### Test 3: API Health Check
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

### Important Database Notes

1. **User Approval Workflow**
   - Students: Auto-approved on creation
   - TPO: Requires admin approval (is_approved = false)
   - Admin: Only created by existing admin

2. **Resume Management**
   - Students can upload multiple resumes
   - Set `is_primary = true` for the resume to use in applications
   - TPO can verify resumes (is_verified = true)

3. **Certificate Tracking**
   - Certificates can expire (expiry_date field)
   - TPO can verify certificates before job applications

4. **Job Applications**
   - Tracks status: pending → reviewed → shortlisted → accepted/rejected
   - TPO can schedule interviews
   - Interview date and notes are stored

5. **Event Management**
   - Events can be online (Zoom/Meet link) or in-person
   - Track registration capacity and attendance
   - Send notifications to registered users

6. **Notifications**
   - Categorized by type (job_alert, interview_scheduled, etc.)
   - Related to specific objects (job_id, application_id, etc.)
   - Track read status and read timestamp

### Troubleshooting

#### "psycopg2 connection refused"
- Verify PostgreSQL is running
- Check credentials in DATABASE_URL
- Verify database `Project_2` exists

#### "Table already exists"
- Tables are idempotent - safe to run multiple times
- If needed to reset: Drop database and recreate

#### "Clerk authentication failed"
- Verify CLERK_SECRET_KEY in .env
- Check internet connection to Clerk API
- Verify JWT tokens from frontend are valid

### Next Steps

1. **Create API Endpoints**
   - User signup/profile endpoints
   - Job posting and application endpoints
   - File upload endpoints for resumes/certificates

2. **Implement Clerk Integration**
   - Create middleware to verify Clerk tokens
   - Auto-sync users on Clerk webhook events
   - Implement role-based access control

3. **Add Business Logic**
   - Interview scheduling
   - Notification system
   - Resume verification workflow

4. **Optimize Queries**
   - Add database indexes for frequently queried fields
   - Implement pagination for list endpoints
   - Cache user profiles and job listings

### Database Maintenance

#### Backup
```bash
pg_dump -U user -h localhost Project_2 > backup.sql
```

#### Restore
```bash
psql -U user -h localhost Project_2 < backup.sql
```

#### Vacuum (Optimize)
```sql
VACUUM ANALYZE;
```

For more information about the database schema, see `DATABASE_SCHEMA.md`
