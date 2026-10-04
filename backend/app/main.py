from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router
from app.routers.jobs import router as jobs_router
from app.routers.applications import router as applications_router

from app.core.config import settings
from app.database.connection import engine
from app.database.base import Base

from app.models.user import User
from app.models.resume import Resume
from app.models.job import Job
from app.models.application import Application

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered recruitment management system",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://talent-match-three.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(resume_router)
app.include_router(jobs_router)
app.include_router(applications_router)


@app.get("/")
def root():
    return {
        "message": "AI Recruitment Portal API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }