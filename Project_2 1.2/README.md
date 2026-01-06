# PrepSphere - College Placement Management System

A modern, responsive web application for managing college placements with role-based dashboards for Students, TPO, and Admin.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TailwindCSS
- ShadCN UI
- Clerk Authentication

### Backend
- FastAPI
- PostgreSQL (or MongoDB as alternative)
- Pydantic for data validation

### Features
- Role-based authentication (Student, TPO, Admin)
- Profile management
- Resume & certificate upload
- Job listings
- Events management
- Notifications system
- AI Tools integration (via iframes)
- Responsive design

## Folder Structure

```
prepsphere/
├── frontend/           # Next.js frontend
│   ├── app/            # App router pages
│   ├── components/     # Reusable components
│   ├── lib/            # Utility functions
│   └── public/         # Static assets
└── backend/            # FastAPI backend
    ├── api/            # API routes
    ├── models/         # Database models
    ├── schemas/        # Pydantic schemas
    └── utils/          # Utility functions
```

## Getting Started

Instructions to run the application are in separate README files in each directory.