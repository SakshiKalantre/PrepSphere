# PrepSphere Setup Instructions

This document provides detailed instructions for setting up the PrepSphere application in your environment.

## Prerequisites

Before beginning the setup, ensure you have the following:

1. **Operating System**: Windows 10/11, macOS 10.14+, or Linux
2. **Administrative privileges** to install software
3. **Internet connection** for downloading dependencies

## Step 1: Install Node.js

1. Visit [nodejs.org](https://nodejs.org/en/download/)
2. Download the LTS version for your operating system
3. Run the installer and follow the setup wizard
4. Verify installation by opening a new terminal/command prompt and running:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Install Python

1. Visit [python.org](https://www.python.org/downloads/)
2. Download Python 3.8 or higher
3. Run the installer, making sure to check "Add Python to PATH"
4. Verify installation:
   ```bash
   python --version
   # or
   python3 --version
   ```

## Step 3: Install PostgreSQL

1. Visit [postgresql.org](https://www.postgresql.org/download/)
2. Download the appropriate version for your OS
3. Run the installer with default settings
4. Note the password you set for the postgres user
5. Verify installation:
   ```bash
   psql --version
   ```

## Step 4: Set Up the Database

1. Open PostgreSQL command line:
   ```bash
   psql -U postgres
   ```

2. Create the database and user:
   ```sql
   CREATE DATABASE prepsphere;
   CREATE USER prepsphere_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE prepsphere TO prepsphere_user;
   \q
   ```

## Step 5: Configure Clerk Authentication

1. Sign up at [clerk.dev](https://clerk.dev)
2. Create a new application
3. In the Clerk dashboard, go to "API Keys"
4. Note your:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)

## Step 6: Configure Environment Variables

### Frontend (.env.local)
Create a file named `.env.local` in the `frontend` directory:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWRqdXN0ZWQtY291Z2FyLTIxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_6mZekood1lRbULaCRaZ4Z7r5DpLFSOC8TqXZAFSQyZ
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Backend (.env)
Create a file named `.env` in the `backend` directory:

```env
DATABASE_URL=postgresql://prepsphere_user:your_secure_password@localhost:5432/prepsphere
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
PROJECT_NAME=PrepSphere
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
SECRET_KEY=your-random-secret-key-at-least-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Step 7: Install Frontend Dependencies

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Step 8: Install Backend Dependencies

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows:
   venv\Scripts\activate
   
   # macOS/Linux:
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Step 9: Run Database Migrations

The application automatically creates tables on first run, but you can also manually create them:

```bash
# Make sure you're in the backend directory with the virtual environment activated
python -c "from main import create_tables; import asyncio; asyncio.run(create_tables())"
```

## Step 10: Run the Application

You'll need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
# Activate virtual environment if not already done
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Run the backend
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Step 11: Access the Application

1. Frontend: http://localhost:3000
2. Backend API: http://localhost:8000
3. Backend API Docs: http://localhost:8000/docs

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 3000 or 8000 are in use, change them:
   ```bash
   # Frontend
   npm run dev -- -p 3001
   
   # Backend
   uvicorn main:app --reload --port 8001
   ```

2. **Database connection errors**: 
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure the database and user exist

3. **Clerk authentication issues**:
   - Verify API keys are correct
   - Check that URLs in Clerk dashboard match your setup

4. **Missing dependencies**:
   - Ensure all npm and pip installations completed successfully
   - Check for error messages during installation

### Need Help?

If you encounter issues:
1. Check the terminal output for error messages
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL) are running
4. Confirm all dependencies are installed

For further assistance, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Clerk Documentation](https://docs.clerk.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)