from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.v1 import users, jobs, events, files, notifications, tpo, profiles, admin
from app.core.config import settings
from app.db.session import engine, Base

# Create tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown
    engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
)

# Include routers
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(jobs.router, prefix=f"{settings.API_V1_STR}/jobs", tags=["jobs"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(files.router, prefix=f"{settings.API_V1_STR}/files", tags=["files"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(tpo.router, prefix=f"{settings.API_V1_STR}/tpo", tags=["tpo"])
app.include_router(profiles.router, prefix=f"{settings.API_V1_STR}", tags=["profiles"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to PrepSphere API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
