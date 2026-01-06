# Running PrepSphere Locally

This guide explains how to run the PrepSphere application locally for development and testing.

## Prerequisites

Before running the application, ensure you have installed:

1. **Node.js** (version 18 or higher)
2. **Python** (version 3.8 or higher)
3. **PostgreSQL** database
4. **Git** (for cloning the repository)

## Setting Up the Environment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd prepsphere
```

### 2. Set Up the Database

Install PostgreSQL and create a database:

```sql
CREATE DATABASE prepsphere_dev;
CREATE USER prepsphere_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE prepsphere_dev TO prepsphere_user;
```

## Running the Backend (FastAPI)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://prepsphere_user:dev_password@localhost:5432/prepsphere_dev
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
PROJECT_NAME=PrepSphere
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
SECRET_KEY=your-development-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. Run the Backend Server

```bash
uvicorn main:app --reload
```

The backend will be available at: http://localhost:8000

API documentation: http://localhost:8000/docs

## Running the Frontend (Next.js)

### 1. Navigate to Frontend Directory

In a new terminal window:

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Run the Frontend Server

```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

## Setting Up Clerk Authentication

1. Sign up at [clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your API keys from the Clerk dashboard
4. Update the environment variables with your actual keys

## File Uploads

The application stores uploaded files in the `backend/uploads` directory. This directory is automatically created when you first upload a file.

## Development Workflow

### Running Both Servers Simultaneously

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Database Migrations

The application automatically creates database tables on startup. For production environments, you might want to use Alembic for migrations:

```bash
# Install alembic
pip install alembic

# Initialize (only once)
alembic init alembic

# Generate migration
alembic revision --autogenerate -m "Migration message"

# Apply migration
alembic upgrade head
```

## Testing the Application

### 1. Access the Homepage

Visit http://localhost:3000 to see the public homepage.

### 2. Register/Login

Use the sign-up option to create a new account or sign in with an existing one.

### 3. Test Different Roles

The application supports three roles:
- **Student**: Default role for new users
- **TPO**: Training and Placement Officer
- **Admin**: Administrator

For testing purposes, you can modify user roles directly in the database or implement a role-switching feature.

### 4. Test File Uploads

Try uploading resumes and certificates to test the file handling functionality.

### 5. Test API Endpoints

Use the Swagger UI at http://localhost:8000/docs to test API endpoints directly.

## Common Issues and Solutions

### 1. Port Conflicts

If ports 3000 or 8000 are already in use:

**Frontend:**
```bash
npm run dev -- -p 3001
```

**Backend:**
```bash
uvicorn main:app --reload --port 8001
```

Remember to update the CORS origins in the backend `.env` file if you change the frontend port.

### 2. Database Connection Issues

Ensure:
- PostgreSQL is running
- Database credentials are correct
- The database exists
- The user has proper permissions

### 3. Missing Environment Variables

Double-check that all required environment variables are set in both `.env` (backend) and `.env.local` (frontend).

### 4. CORS Errors

Ensure `BACKEND_CORS_ORIGINS` in your backend `.env` includes your frontend URL.

## Stopping the Application

To stop the servers, press `Ctrl+C` in each terminal window.

To deactivate the Python virtual environment:
```bash
deactivate
```

## Useful Commands

### Backend

```bash
# Run tests (if implemented)
python -m pytest

# Format code
black .

# Check for code issues
flake8

# Run specific module
python -m app.main
```

### Frontend

```bash
# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Build for production
npm run build

# Run production build
npm run start
```

## Debugging Tips

1. **Check browser console** for frontend errors
2. **Check terminal output** for backend errors
3. **Use browser dev tools** to inspect network requests
4. **Check database logs** for SQL errors
5. **Enable debug logging** in development

## Next Steps

Once you have the application running locally:

1. Explore the different dashboards (Student, TPO, Admin)
2. Test all CRUD operations
3. Customize the branding and styling
4. Add new features as needed
5. Prepare for deployment using the DEPLOYMENT.md guide