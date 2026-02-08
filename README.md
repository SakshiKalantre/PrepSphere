🚀** Key Features & Modules**
1. Authentication & Security
Provider: Clerk Authentication (Secure, robust user management).
Roles:
Student: Access to jobs, events, profile management.
TPO: Management of placement drive, verification, analytics.
Admin: System-wide user and content control.
Security: Role-Based Access Control (RBAC), JWT verification, CORS protection.

2. Student Module
Profile Management: Detailed academic and personal profile creation.
Document Vault: Upload and manage Resumes and Certificates (PDF/Image).
Job Portal: Browse active job listings, view details, and apply with one click.
Event Calendar: Register for workshops, interviews, and seminars.
Application Tracking: Real-time status updates on job applications.
Analytics: Personal placement insights.

4. TPO (Training & Placement Officer) Module
Dashboard Analytics:
Student Statistics: Total students, Placed/Unplaced counts, Higher Studies, etc.
Job Statistics: Total jobs, Active/Inactive listings, Application volume.
Visualized with Recharts and color-coded metric cards.
Student Verification: Review and approve student profiles and uploaded documents.
Job Management: Create, edit, and close job postings with detailed requirements.
Application Review: Shortlist, accept, or reject student applications.
Event Management: Organize and schedule campus events.

5. Public Interface
Landing Page: Modern, responsive design showcasing college placement highlights.
Recruiter Showcase: Dynamic "Leading Companies" section fetching real company logos via Brandfetch API.
Contact System: Integrated contact form for inquiries.

🎨 **Design & UI/UX**
**Design System**

Framework: Tailwind CSS.
Component Library: ShadCN UI (Radix Primitives).
Icons: Lucide React.
Charts: Recharts.

**Color Palette**
**The application follows a premium academic theme:**

Primary (Maroon): #7A1F2A - Used for headers, primary buttons, and branding.

Accent (Gold): #D6B36A - Used for highlights, active states, and premium touches.

Background (Cream): #FFF8F2 - Used for main content areas for readability.

Neutral: Slate/Gray scale for text and borders.

Layouts

Public: Full-width, hero-centric layouts with responsive navigation.

Dashboard: Sidebar navigation with collapsible menus, sticky headers, and grid-based content areas.

🔧** Technical Stack**
**Frontend**

Core: Next.js 14 (App Router), React 18, TypeScript.

Styling: Tailwind CSS, CSS Modules.

State/Data: React Hooks, SWR (stale-while-revalidate).

Integrations: Clerk (Auth), Brandfetch (Logos), UI Avatars (Fallback).

**Backend**

Core: FastAPI (Python 3.12+), Uvicorn.

Database: PostgreSQL (hosted on Neon DB), SQLAlchemy ORM.

Validation: Pydantic v2.

**File Storage:**

Primary: Cloudflare R2 (S3-compatible object storage).

Fallback: Local filesystem storage (for development).

Features: MIME type validation, file hashing, size limits (10MB).

**💾 Database Schema Overview**

The system uses a relational PostgreSQL database with the following key entities:

Users & Profiles: Core identity and extended student details.

Jobs & Applications: Recruitment drive management.

Events & Registrations: Campus activity tracking.

Files & Certificates: Document metadata and verification status.

Analytics: Aggregated placement data tables.

Notifications: System-wide alert tracking.
