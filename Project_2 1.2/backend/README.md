# PrepSphere Backend

This is the backend API for PrepSphere, built with FastAPI and SQLAlchemy.

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (with SQLAlchemy ORM)
- **Authentication**: Clerk JWT verification
- **File Storage**: Local file system (can be extended to S3)

## Prerequisites

- Python 3.8+
- PostgreSQL database
- pip (Python package installer)

## Getting Started

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/prepsphere
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   PROJECT_NAME=PrepSphere
   BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
   UPLOAD_FOLDER=./uploads
   MAX_FILE_SIZE=10485760
   SECRET_KEY=your-secret-key-change-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

5. Open [http://localhost:8000/docs](http://localhost:8000/docs) to view the API documentation.

## Project Structure

```
backend/
├── app/                 # Main application package
│   ├── api/             # API routes
│   │   └── v1/         # Version 1 of the API
│   ├── core/            # Core configuration and security
│   ├── db/              # Database session and connection
│   ├── models/          # Database models
│   └── schemas/         # Pydantic schemas for validation
├── uploads/             # Uploaded files (created automatically)
├── main.py              # Application entry point
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (not included in repo)
```

## API Endpoints

- `/api/v1/users` - User management
- `/api/v1/profiles` - User profiles
- `/api/v1/jobs` - Job listings and applications
- `/api/v1/events` - Events management
- `/api/v1/files` - File upload and management
- `/api/v1/notifications` - Notification system

## Available Scripts

- `uvicorn main:app --reload` - Runs the app in development mode
- `uvicorn main:app --host 0.0.0.0 --port 8000` - Runs the app in production mode

## Deployment

To deploy the backend:

1. Set up a PostgreSQL database
2. Configure environment variables
3. Install dependencies: `pip install -r requirements.txt`
4. Run the application: `uvicorn main:app --host 0.0.0.0 --port 8000`

For production deployment, consider using:
- Docker containers
- Cloud platforms like Heroku, AWS, or Google Cloud
- Process managers like Gunicorn