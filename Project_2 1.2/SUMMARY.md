# PrepSphere - College Placement Management System

A complete, modern web application for managing college placements with role-based dashboards for Students, TPO, and Admin.

## 🏗️ Project Structure

```
prepsphere/
├── frontend/           # Next.js frontend application
│   ├── app/            # App router pages and layouts
│   │   ├── dashboard/  # Role-based dashboards
│   │   │   ├── student/
│   │   │   ├── tpo/
│   │   │   └── admin/
│   │   └── ...         # Public pages
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utility functions
│   └── public/         # Static assets
├── backend/            # FastAPI backend API
│   ├── app/            # Main application package
│   │   ├── api/        # API routes
│   │   ├── core/       # Configuration and security
│   │   ├── db/         # Database session
│   │   ├── models/     # Database models
│   │   └── schemas/    # Pydantic schemas
│   ├── uploads/        # File storage directory
│   ├── main.py         # Application entry point
│   ├── requirements.txt# Python dependencies
│   └── .env.example    # Environment variables template
├── RUNNING.md          # Local development guide
├── DEPLOYMENT.md       # Production deployment guide
└── README.md           # Project overview
```

## 🚀 Key Features

### Authentication
- Clerk integration for secure authentication
- Google and email login support
- Role-based access control (Student, TPO, Admin)

### Public Pages
- Responsive homepage with college information
- About section for placement cell
- Recruiters showcase
- Achievements display
- Contact form and information

### Student Dashboard
- Profile management
- Resume and certificate upload
- Job listings browsing
- Event registration
- Notification system
- AI tools integration (iframe)

### TPO Dashboard
- Student profile approval
- Resume review system
- Job posting management
- Event creation
- Applicant tracking
- Email notifications

### Admin Dashboard
- User management
- Role assignment
- Analytics and reporting
- College content management

### Backend API
- RESTful API with FastAPI
- PostgreSQL database integration
- File upload and management
- Clerk token verification
- Comprehensive data models

## 🎨 Design & UX

### Color Scheme
- **Maroon**: #7A1F2A (Primary brand color)
- **Gold**: #D6B36A (Accent and highlights)
- **Cream**: #FFF8F2 (Background and light elements)

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Flexible grid layouts
- Touch-friendly interactions

### UI Components
- Modern card-based design
- Intuitive navigation
- Clear visual hierarchy
- Consistent styling across roles

## 🔧 Technical Implementation

### Frontend Stack
- **Next.js 14** with App Router
- **TailwindCSS** for styling
- **ShadCN UI** components
- **Clerk** authentication
- **TypeScript** for type safety

### Backend Stack
- **FastAPI** for API development
- **SQLAlchemy** ORM
- **PostgreSQL** database
- **Pydantic** for data validation
- **Clerk SDK** for authentication

### File Handling
- Support for PDF, JPG, PNG files
- 10MB file size limit
- Metadata storage in database
- File storage in local directory

## 📱 Dashboards Overview

### Student Dashboard
- Personal profile editing
- Document upload interface
- Job listing cards with filters
- Event calendar view
- Notification center
- AI tools access

### TPO Dashboard
- Pending approvals queue
- Job posting creation form
- Event management system
- Application tracking
- Communication tools

### Admin Dashboard
- User management table
- Analytics charts
- Content editing forms
- Role assignment controls

## 🔐 Security Features

- JWT-based authentication
- Role-based authorization
- File type validation
- Size limit enforcement
- CORS protection
- SQL injection prevention

## 📈 Performance Optimizations

- Database indexing
- API response caching
- Lazy loading components
- Image optimization
- Bundle splitting

## 🛠️ Development Experience

### Frontend
- Component-driven development
- TypeScript for error prevention
- ESLint and Prettier for code quality
- Hot reloading in development

### Backend
- Auto-generated API documentation
- Pydantic validation
- SQLAlchemy relationships
- Environment-based configuration

## 🚀 Deployment Ready

- Containerization support
- Environment variable configuration
- Database migration patterns
- CI/CD pipeline ready
- Monitoring and logging hooks

## 📖 Documentation

- Comprehensive setup guides
- Deployment instructions
- API documentation
- Troubleshooting guides
- Best practices

## ✅ Getting Started

1. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Environment Configuration**:
   - Copy `.env.example` to `.env`
   - Update with your credentials

## 🎯 Future Enhancements

- Real-time notifications with WebSocket
- Advanced analytics dashboard
- Mobile application
- AI-powered job matching
- Video interview integration
- Alumni network features

## 🤝 Support

For issues, questions, or contributions:
1. Check the documentation in each directory
2. Review existing issues
3. Submit bug reports or feature requests
4. Contribute improvements via pull requests

---

*PrepSphere is designed to streamline college placement processes with a modern, user-friendly interface and robust backend functionality.*