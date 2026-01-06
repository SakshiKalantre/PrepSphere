# PrepSphere Deployment Guide

This guide provides instructions for deploying the PrepSphere application to production environments.

## Prerequisites

Before deploying, ensure you have:

1. Domain name (optional but recommended)
2. SSL certificate (recommended for HTTPS)
3. Server/VPS with:
   - Node.js 18+ for frontend
   - Python 3.8+ for backend
   - PostgreSQL database
   - At least 2GB RAM
4. Clerk account with API keys

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │    Backend       │
│   (Next.js)     │◄──►│   (FastAPI)      │
│                 │    │                  │
└─────────────────┘    └─────────▲────────┘
                                 │
                       ┌─────────▼────────┐
                       │  PostgreSQL DB   │
                       │                  │
                       └──────────────────┘
```

## Frontend Deployment (Next.js)

### Option 1: Vercel (Recommended)

1. Push your frontend code to GitHub/GitLab
2. Sign up at [vercel.com](https://vercel.com)
3. Create a new project and import your repository
4. Set environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```
5. Deploy and Vercel will provide you with a URL

### Option 2: Manual Deployment

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the application using a web server like Nginx:
   ```bash
   npm install -g serve
   serve -s out -l 3000
   ```

## Backend Deployment (FastAPI)

### Option 1: Render/Heroku

1. Push your backend code to GitHub/GitLab
2. Create a new web service on Render/Heroku
3. Set environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   CLERK_SECRET_KEY=your_clerk_secret_key
   SECRET_KEY=your_random_secret_key
   ```

### Option 2: Manual Deployment

1. Set up a server with Python 3.8+
2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Set environment variables in `.env` file

4. Run with Gunicorn (production WSGI server):
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
   ```

## Database Setup (PostgreSQL)

### Option 1: Managed Database (Recommended)

Use services like:
- Supabase
- Render PostgreSQL
- Heroku Postgres
- AWS RDS
- Google Cloud SQL

### Option 2: Self-hosted

1. Install PostgreSQL:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql-server postgresql-contrib
   ```

2. Create database and user:
   ```sql
   CREATE DATABASE prepsphere;
   CREATE USER prepsphere_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE prepsphere TO prepsphere_user;
   ```

3. Update DATABASE_URL in your backend `.env`:
   ```
   DATABASE_URL=postgresql://prepsphere_user:your_secure_password@localhost:5432/prepsphere
   ```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
CLERK_SECRET_KEY=your_clerk_secret_key_here
SECRET_KEY=your_random_secret_key_at_least_32_characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760
PROJECT_NAME=PrepSphere
BACKEND_CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
```

## SSL Configuration

### Using Let's Encrypt (Certbot)

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Reverse Proxy Setup (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API (FastAPI)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Maintenance

### Health Checks

Both frontend and backend expose health check endpoints:
- Frontend: `GET /` (returns welcome message)
- Backend: `GET /health` (returns {"status": "healthy"})

### Logging

Configure logging in production:

#### Backend logging (logging.conf):
```ini
[loggers]
keys=root,app

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=DEBUG
handlers=consoleHandler

[logger_app]
level=INFO
handlers=consoleHandler,fileHandler
qualname=app
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=DEBUG
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=simpleFormatter
args=('app.log',)
```

## Backup Strategy

### Database Backups

1. Automated daily backups:
   ```bash
   pg_dump prepsphere | gzip > backup_$(date +%Y%m%d).sql.gz
   ```

2. Store backups in secure location (cloud storage, S3, etc.)

### File Backups

1. Regular backups of the uploads directory
2. Consider using cloud storage (AWS S3, Google Cloud Storage) for file storage in production

## Scaling Considerations

### Horizontal Scaling

1. Use load balancer for multiple frontend/backend instances
2. Shared database or database clustering
3. Shared file storage (S3, Google Cloud Storage)

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Database optimization (indexes, query optimization)
3. Caching (Redis)

## Security Best Practices

1. Always use HTTPS
2. Keep dependencies updated
3. Use strong passwords and rotate them regularly
4. Implement rate limiting
5. Regular security audits
6. Secure file uploads (validate MIME types, file sizes)
7. Use environment variables for secrets (never hardcode)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure BACKEND_CORS_ORIGINS includes your frontend domain
2. **Database Connection**: Verify DATABASE_URL format and credentials
3. **Clerk Authentication**: Check API keys and domain settings in Clerk dashboard
4. **File Upload Issues**: Check file size limits and permissions

### Logs

Check logs for error messages:
- Application logs
- Web server logs (Nginx/Apache)
- Database logs
- System logs

## Support

For issues with deployment, contact the development team or refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Clerk Documentation](https://docs.clerk.dev/)