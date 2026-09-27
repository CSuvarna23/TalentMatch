from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume
from app.models.user import User

from app.schemas.job import JobUpdate

from app.routers.auth import (
    require_hr,
    get_current_user
)


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


# =========================================
# Create Job
# =========================================

@router.post("/")
def create_job(
    job_title: str,
    description: str,
    required_skills: str,
    experience: str,
    location: str,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    new_job = Job(
        job_title=job_title,
        description=description,
        required_skills=required_skills,
        experience=experience,
        location=location,
        created_by=current_user.id,
        
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {
        "message": "Job created successfully",
        "job_id": new_job.job_id,
        "job_title": new_job.job_title,
        "required_skills": new_job.required_skills,
        "experience": new_job.experience,
        "location": new_job.location
    }


# =========================================
# Get Active Jobs
# =========================================

@router.get("/")
def get_jobs(
    db: Session = Depends(get_db)
):

    jobs = (
        db.query(Job)
        
        .all()
    )

    return jobs


# =========================================
# Get One Job
# =========================================

@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(
            Job.job_id == job_id,
            
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


# =========================================
# Update Job
# =========================================

@router.put("/{job_id}")
def update_job(
    job_id: int,
    job_data: JobUpdate,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(
            Job.job_id == job_id,
            Job.created_by == current_user.id,
            
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found or you are not authorized to edit this job"
        )

    job.job_title = job_data.job_title
    job.description = job_data.description
    job.required_skills = job_data.required_skills
    job.experience = job_data.experience
    job.location = job_data.location

    db.commit()
    db.refresh(job)

    return {
        "message": "Job updated successfully",
        "job_id": job.job_id,
        "job_title": job.job_title,
        "description": job.description,
        "required_skills": job.required_skills,
        "experience": job.experience,
        "location": job.location
    }


# =========================================
# Disable Job
# =========================================

@router.patch("/{job_id}/disable")
def disable_job(
    job_id: int,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(
            Job.job_id == job_id,
            Job.created_by == current_user.id,
            
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found or already disabled"
        )

    

    db.commit()
    db.refresh(job)

    return {
        "message": "Job disabled successfully",
        "job_id": job.job_id
    }


# =========================================
# Applicants
# =========================================

@router.get("/{job_id}/applicants")
def get_job_applicants(
    job_id: int,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(
            Job.job_id == job_id,
            Job.created_by == current_user.id,
            
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found or you are not authorized to view this job"
        )

    applications = (
        db.query(Application, User, Resume)
        .join(
            User,
            Application.user_id == User.id
        )
        .join(
            Resume,
            Application.resume_id == Resume.resume_id
        )
        .filter(
            Application.job_id == job_id
        )
        .order_by(
            Application.applied_at.desc()
        )
        .all()
    )

    return [
        {
            "application_id":
                application.application_id,

            "candidate_name":
                user.name,

            "candidate_email":
                user.email,

            "match_score":
                float(application.match_score),

            "status":
                application.status,

            "resume_id":
                resume.resume_id,

            "resume_name":
                resume.file_name,

            "matched_skills": [
                skill.strip()
                for skill in (
                    application.matched_skills or ""
                ).split(",")
                if skill.strip()
            ],

            "missing_skills": [
                skill.strip()
                for skill in (
                    application.missing_skills or ""
                ).split(",")
                if skill.strip()
            ],

            "applied_at":
                application.applied_at
        }

        for application, user, resume
        in applications
    ]


# =========================================
# Applicant Details
# =========================================

@router.get(
    "/{job_id}/applicants/{application_id}"
)
def get_applicant_details(
    job_id: int,
    application_id: int,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(
            Job.job_id == job_id,
            Job.created_by == current_user.id,
           
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found or you are not authorized to view this job"
        )

    result = (
        db.query(Application, User, Resume)
        .join(
            User,
            Application.user_id == User.id
        )
        .join(
            Resume,
            Application.resume_id == Resume.resume_id
        )
        .filter(
            Application.application_id == application_id,
            Application.job_id == job_id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application, candidate, resume = result

    return {
        "application_id":
            application.application_id,

        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email
        },

        "job": {
            "job_id": job.job_id,
            "job_title": job.job_title
        },

        "status":
            application.status,

        "match_score":
            float(application.match_score),

        "matched_skills": [
            skill.strip()
            for skill in (
                application.matched_skills or ""
            ).split(",")
            if skill.strip()
        ],

        "missing_skills": [
            skill.strip()
            for skill in (
                application.missing_skills or ""
            ).split(",")
            if skill.strip()
        ],

        "resume": {
            "resume_id":
                resume.resume_id,

            "file_name":
                resume.file_name,

            "uploaded_at":
                resume.uploaded_at
        },

        "applied_at":
            application.applied_at
    }