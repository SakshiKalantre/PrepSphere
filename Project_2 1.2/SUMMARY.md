# PrepSphere - College Placement Management System

PrepSphere is a comprehensive, modern web application designed to streamline the college placement process. It bridges the gap between Students, Training & Placement Officers (TPOs), and Administrators through role-specific dashboards and efficient data management.

## 🏗️ Project Structure

```
Project_2 1.2/
├── Prepsphere_1.2/
├── backend/            # FastAPI Backend Application
│   ├── app/            # Core Application Logic
│   │   ├── api/        # REST API Routes (v1)
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
│   │   ├── core/       # Config, Security, Auth
│   │   │   ├── clerk_auth.py
│   │   │   └── config.py
│   │   ├── db/         # Database Session & Base
│   │   │   └── session.py
│   │   ├── models/     # SQLAlchemy Database Models
│   │   │   ├── analytics.py
│   │   │   ├── certificate.py
│   │   │   ├── contact_message.py
│   │   │   ├── event.py
│   │   │   ├── file.py
│   │   │   ├── job.py
│   │   │   ├── notification.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   ├── schemas/    # Pydantic Data Schemas
│   │   │   ├── analytics.py
│   │   │   ├── contact_message.py
│   │   │   ├── event.py
│   │   │   ├── file.py
│   │   │   ├── job.py
│   │   │   ├── notification.py
│   │   │   └── user.py
│   ├── uploads/        # Local File Storage (Fallback)
│   ├── .env
│   ├── main.py         # App Entry Point
│   └── requirements.txt# Python Dependencies
├── frontend/           # Next.js 15.2.3 Frontend Application
│   ├── app/            # App Router (Pages & Layouts)
│   │   ├── api/
│   │   ├── dashboard/  # Secured Role-Based Dashboards
│   │   │   ├── student/# Student Interface
│   │   │   ├── tpo/    # TPO Interface
│   │   │   └── admin/  # Admin Interface
│   │   ├── reset-password/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── verify-email/
│   │   ├── globals.css
│   │   ├── layout.tsx  # Root Layout
│   │   └── page.tsx
│   ├── components/     # Reusable UI Components (ShadCN/Custom)
│   │   ├── ai-tools/
│   │   ├── ui/
│   │   ├── Chatbot.tsx
│   │   └── LogoutButton.tsx
│   ├── lib/            # Utilities (API clients, formatting)
│   │   ├── chatbotKnowledge.ts
│   │   └── utils.ts
│   └── public/         # Static Assets
├── DATABASE_SCHEMA.md  # Detailed Database Documentation
├── DATABASE_SETUP.md   # Database Setup Instructions
├── DEPLOYMENT.md       # Deployment Guide
├── ROLE_BASED_SIGNUP.md# Role-Based Signup Implementation
├── RUNNING.md          # Running Instructions
├── SETUP_INSTRUCTIONS.md# Setup Instructions
├── SUMMARY.md          # Project Summary
└── README.md           # Quick Start Guide
```

## 🚀 Key Features & Modules

### 1. Authentication & Security
*   **Provider**: Clerk Authentication (Secure, robust user management).
*   **Roles**:
    *   **Student**: Access to jobs, events, profile management.
    *   **TPO**: Management of placement drive, verification, analytics.
    *   **Admin**: System-wide user and content control.
*   **Security**: Role-Based Access Control (RBAC), JWT verification, CORS protection.

### 2. Student Module
*   **Profile Management**: Detailed academic and personal profile creation.
*   **Document Vault**: Upload and manage Resumes and Certificates (PDF/Image).
*   **Job Portal**: Browse active job listings, view details, and apply with one click.
*   **Event Calendar**: Register for workshops, interviews, and seminars.
*   **Application Tracking**: Real-time status updates on job applications.
*   **Analytics**: Personal placement insights.

### 3. TPO (Training & Placement Officer) Module
*   **Dashboard Analytics**:
    *   **Student Statistics**: Total students, Placed/Unplaced counts, Higher Studies, etc.
    *   **Job Statistics**: Total jobs, Active/Inactive listings, Application volume.
    *   *Visualized with Recharts and color-coded metric cards.*
*   **Student Verification**: Review and approve student profiles and uploaded documents.
*   **Job Management**: Create, edit, and close job postings with detailed requirements.
*   **Application Review**: Shortlist, accept, or reject student applications.
*   **Event Management**: Organize and schedule campus events.

### 4. Admin Module
*   **User Management**: Monitor and manage all users across the platform.
*   **System Administration**: Oversee platform operations and content.
*   **Analytics Oversight**: Access to comprehensive platform analytics.

### 5. Public Interface
*   **Landing Page**: Modern, responsive design showcasing college placement highlights.
*   **Recruiter Showcase**: Dynamic "Leading Companies" section fetching real company logos via **Brandfetch API**.
*   **Contact System**: Integrated contact form for inquiries.

### 6. Email & Communication
*   **Account Verification**: Automatic email verification system.
*   **Password Reset**: Secure password reset functionality.
*   **Direct Email**: Mailto links for direct communication between users.

## 🎨 Design & UI/UX

### Design System
*   **Framework**: Tailwind CSS.
*   **Component Library**: ShadCN UI (Radix Primitives), Radix UI.
*   **Icons**: Lucide React.
*   **Charts**: Recharts.

### Color Palette
The application follows a premium academic theme:
*   **Primary (Maroon)**: `#7A1F2A` - Used for headers, primary buttons, and branding.
*   **Accent (Gold)**: `#D6B36A` - Used for highlights, active states, and premium touches.
*   **Background (Cream)**: `#FFF8F2` - Used for main content areas for readability.
*   **Neutral**: Slate/Gray scale for text and borders.

### Layouts
*   **Public**: Full-width, hero-centric layouts with responsive navigation.
*   **Dashboard**: Sidebar navigation with collapsible menus, sticky headers, and grid-based content areas.

## 🔧 Technical Stack

### Frontend
*   **Core**: Next.js 15.2.3 (App Router), React 18, TypeScript.
*   **Styling**: Tailwind CSS, CSS Modules.
*   **State/Data**: React Hooks, SWR (stale-while-revalidate).
*   **Integrations**: Clerk (Auth), Brandfetch (Logos), UI Avatars (Fallback).
*   **UI Components**: Radix UI, ShadCN UI.

### Backend
*   **Core**: FastAPI (Python 3.8+), Uvicorn.
*   **Database**: PostgreSQL (hosted on **Neon DB**), SQLAlchemy ORM.
*   **Validation**: Pydantic v2.
*   **Authentication**: Clerk JWT verification.
*   **File Storage**:
    *   **Primary**: Cloudflare R2 (S3-compatible object storage).
    *   **Fallback**: Local filesystem storage (for development).
    *   **Features**: MIME type validation, file hashing, size limits (10MB).
*   **Email**: SMTP functionality for verification and notifications.

## 💾 Database Schema Overview

The system uses a relational PostgreSQL database with the following key entities:
*   **Users & Profiles**: Core identity and extended student details.
*   **Jobs & Applications**: Recruitment drive management.
*   **Events & Registrations**: Campus activity tracking.
*   **Files & Certificates**: Document metadata and verification status.
*   **Analytics**: Aggregated placement data tables.
*   **Notifications**: System-wide alert tracking.
*   **Contact Messages**: Inquiry and feedback management.
*   **Password Reset Tokens**: Secure password reset functionality.

*(See `DATABASE_SCHEMA.md` for full detailed schema)*
