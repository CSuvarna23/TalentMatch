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
    require_candidate,
    get_current_user
)

from app.services.job_matcher import calculate_match
from app.services.resume_classifier import predict_category
from app.services.skill_extractor import extract_skills


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
    category: str | None = None,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    new_job = Job(
        job_title=job_title,
        category=category,
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
        "category": new_job.category,
        "required_skills": new_job.required_skills,
        "experience": new_job.experience,
        "location": new_job.location
    }


# =========================================
# Get Active Jobs
# =========================================

@router.get("/")
def get_jobs(
    include_disabled: bool = False,
    db: Session = Depends(get_db)
):

    query = db.query(Job)

    if not include_disabled:
        query = query.filter(Job.is_active == True)

    jobs = query.all()

    return jobs


@router.get("/recommended")
def get_recommended_jobs(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
    include_applied: bool = False
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id,
            Resume.is_current == True
        )
        .first()
    )

    if resume is None or not resume.extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume before requesting recommendations"
        )

    resume_text = resume.extracted_text
    resume_skills = extract_skills(resume_text)
    resume_category = predict_category(resume_text)
    applied_job_ids = {
        job_id
        for (job_id,) in db.query(Application.job_id).filter(
            Application.user_id == current_user.id
        ).all()
    }
    recommendations = []

    if include_applied:
        jobs = db.query(Job).filter(Job.is_active == True).all()
    else:
        jobs = db.query(Job).filter(
            Job.is_active == True,
            ~Job.job_id.in_(applied_job_ids)
        ).all()

    for job in jobs:
        required_skills = [
            skill.strip()
            for skill in (job.required_skills or "").split(",")
            if skill.strip()
        ]
        job_text = " ".join(
            part
            for part in [
                job.job_title or "",
                job.description or "",
                job.required_skills or "",
                job.experience or "",
                job.location or ""
            ]
            if part.strip()
        )
        match_result = calculate_match(
            resume_skills=resume_skills,
            required_skills=required_skills,
            resume_text=resume_text,
            job_text=job_text,
            resume_category=resume_category,
            job_category=job.category or ""
        )

        recommendations.append({
            "job_id": job.job_id,
            "job_title": job.job_title,
            "category": job.category,
            "description": job.description,
            "required_skills": job.required_skills,
            "experience": job.experience,
            "location": job.location,
            **match_result
        })

    return sorted(
        recommendations,
        key=lambda recommendation: recommendation["match_score"],
        reverse=True
    )


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
    job.category = job_data.category
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
        "category": job.category,
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

    job.is_active = False

    db.commit()
    db.refresh(job)

    return {
        "message": "Job disabled successfully",
        "job_id": job.job_id,
        "is_active": job.is_active
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