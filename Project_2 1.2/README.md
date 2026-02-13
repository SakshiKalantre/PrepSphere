# PrepSphere - College Placement Management System

A modern, responsive web application for managing college placements with role-based dashboards for Students, TPO, and Admin.

## Tech Stack

### Frontend
- Next.js 15.2.3 (App Router)
- React 18+
- TypeScript
- TailwindCSS
- ShadCN UI
- Clerk Authentication
- Radix UI Components

### Backend
- Python 3.8+
- FastAPI
- PostgreSQL (with SQLAlchemy ORM)
- Pydantic for data validation
- Uvicorn ASGI server

### Third-Party Services
- Clerk for authentication
- Cloudflare R2 for file storage
- Gmail SMTP for email functionality

### Features
- Role-based authentication (Student, TPO, Admin)
- Profile management
- Resume & certificate upload
- Job listings and applications
- Events management
- Notifications system
- AI Tools integration (via iframes)
- Email verification and password reset
- Contact messaging system
- Analytics and reporting
- Responsive design
- Real-time dashboard updates

## Current Functionalities

### Backend APIs
- User management (registration, login, profile updates)
- Job posting and application management
- Event creation and registration
- File upload for resumes and certificates
- Notification system
- Email verification and password reset
- Contact messaging
- Analytics and reporting
- Admin/TPO/Student role-specific endpoints

### Frontend Components
- Dynamic dashboards for each role (Admin, TPO, Student)
- Interactive charts and analytics displays
- Form handling for profile updates
- File upload interfaces
- Real-time notifications
- AI tools integration
- Responsive layouts for all devices

### Email System
- Account verification emails
- Password reset functionality
- Direct email communication via mailto links

### Security Features
- JWT-based authentication via Clerk
- Role-based access control
- Secure file upload handling
- SQL injection prevention via SQLAlchemy ORM

## Folder Structure

```
Project_2 1.2/
├── Prepsphere_1.2/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── admin.py
│   │   │       ├── clerk_webhook.py
│   │   │       ├── contact_message.py
│   │   │       ├── events.py
│   │   │       ├── files.py
│   │   │       ├── jobs.py
│   │   │       ├── notifications.py
│   │   │       ├── profiles.py
│   │   │       ├── public.py
│   │   │       ├── tpo.py
│   │   │       ├── users.py
│   │   ├── core/
│   │   │   ├── clerk_auth.py
│   │   │   └── config.py
│   │   ├── db/
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── analytics.py
│   │   │   ├── certificate.py
│   │   │   ├── contact_message.py
│   │   │   ├── event.py
│   │   │   ├── file.py
│   │   │   ├── job.py
│   │   │   ├── notification.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── analytics.py
│   │   │   ├── contact_message.py
│   │   │   ├── event.py
│   │   │   ├── file.py
│   │   │   ├── job.py
│   │   │   ├── notification.py
│   │   │   └── user.py
│   ├── uploads/
│   ├── .env
│   ├── main.py
│   ├── requirements.txt
│   └── various utility scripts
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── reset-password/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── verify-email/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ai-tools/
│   │   ├── ui/
│   │   ├── Chatbot.tsx
│   │   └── LogoutButton.tsx
│   ├── lib/
│   │   ├── chatbotKnowledge.ts
│   │   └── utils.ts
│   ├── public/
│   ├── .env.local
│   ├── middleware.ts
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
├── DATABASE_SCHEMA.md
├── DATABASE_SETUP.md
├── DEPLOYMENT.md
├── ROLE_BASED_SIGNUP.md
├── RUNNING.md
├── SETUP_INSTRUCTIONS.md
└── SUMMARY.md
```

## Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)
- PostgreSQL database
- npm or yarn package manager

### Running the Application

1. **Backend Setup**:
   - Navigate to the `backend/` directory
   - Install dependencies: `pip install -r requirements.txt`
   - Set up environment variables in `.env` file
   - Run the server: `python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

2. **Frontend Setup**:
   - Navigate to the `frontend/` directory
   - Install dependencies: `npm install`
   - Set up environment variables in `.env.local` file
   - Run the development server: `npm run dev`

3. The application will be accessible at:
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/prepsphere
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
PROJECT_NAME=PrepSphere
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_ACCOUNT_ID=your_r2_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_r2_endpoint
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key
```

## Documentation Files
- `DATABASE_SCHEMA.md` - Detailed database schema
- `DATABASE_SETUP.md` - Database setup instructions
- `DEPLOYMENT.md` - Deployment guidelines
- `ROLE_BASED_SIGNUP.md` - Role-based signup process
- `RUNNING.md` - Running instructions
- `SETUP_INSTRUCTIONS.md` - Comprehensive setup guide
- `SUMMARY.md` - Project summary