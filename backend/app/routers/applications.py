from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User

from app.routers.auth import require_candidate
from fastapi.responses import Response
from app.services.skill_extractor import extract_skills
from app.services.job_matcher import calculate_match

from app.routers.auth import (
    require_candidate,
    require_hr
)

from app.schemas.application import ApplicationStatusUpdate
router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


@router.post("/jobs/{job_id}/apply")
def apply_for_job(
    job_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):

    # 1. Find the job
    job = (
        db.query(Job)
        .filter(Job.job_id == job_id)
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    # 2. Get candidate's current resume
    resume = (
        db.query(Resume)
        .filter(
            Resume.user_id == current_user.id,
            Resume.is_current == True
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=400,
            detail="Please upload a resume before applying"
        )


    # 3. Prevent duplicate application
    existing_application = (
        db.query(Application)
        .filter(
            Application.user_id == current_user.id,
            Application.job_id == job_id
        )
        .first()
    )

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this job"
        )


    # 4. Extract skills from resume
    resume_skills = extract_skills(
        resume.extracted_text or ""
    )


    # 5. Convert job skills into a list
    required_skills = [
        skill.strip()
        for skill in (job.required_skills or "").split(",")
        if skill.strip()
    ]


    # 6. Calculate match
    match_result = calculate_match(
        resume_skills,
        required_skills
    )


    # 7. Create application
    application = Application(
    user_id=current_user.id,
    job_id=job_id,
    resume_id=resume.resume_id,
    status="Under Review",
    match_score=match_result["match_score"],
    matched_skills=", ".join(
        match_result["matched_skills"]
    ),
    missing_skills=", ".join(
        match_result["missing_skills"]
    )
)

    db.add(application)
    db.commit()
    db.refresh(application)


    # 8. Return application result
    return {
        "message": "Application submitted successfully",
        "application_id": application.application_id,
        "job_id": job.job_id,
        "job_title": job.job_title,
        "resume_id": resume.resume_id,
        "resume_name": resume.file_name,
        "status": application.status,
        "match_score": match_result["match_score"],
        "matched_skills": match_result["matched_skills"],
        "missing_skills": match_result["missing_skills"]
    }

@router.get("/me")
def get_my_applications(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    applications = (
        db.query(Application, Job, Resume)
        .join(Job, Application.job_id == Job.job_id)
        .join(Resume, Application.resume_id == Resume.resume_id)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    return [
        {
            "application_id": application.application_id,
            "job_id": job.job_id,
            "job_title": job.job_title,
            "company": "AI Recruitment Portal",
            "status": application.status,
            "match_score": float(application.match_score),
            "resume_id": resume.resume_id,
            "resume_name": resume.file_name,
            "applied_at": application.applied_at
        }
        for application, job, resume in applications
    ]

@router.get("/{application_id}")
def get_application_details(
    application_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):
    result = (
        db.query(Application, Job, Resume)
        .join(Job, Application.job_id == Job.job_id)
        .join(Resume, Application.resume_id == Resume.resume_id)
        .filter(
            Application.application_id == application_id,
            Application.user_id == current_user.id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    application, job, resume = result

    return {
        "application_id": application.application_id,
        "job": {
            "job_id": job.job_id,
            "job_title": job.job_title,
            "description": job.description,
            "required_skills": job.required_skills,
            "experience": job.experience,
            "location": job.location
        },
        "status": application.status,
        "match_score": float(application.match_score),
        "matched_skills": [
        skill.strip()
        for skill in (application.matched_skills or "").split(",")
        if skill.strip()
    ],
    "missing_skills": [
        skill.strip()
        for skill in (application.missing_skills or "").split(",")
        if skill.strip()
    ],
    "resume": {
            "resume_id": resume.resume_id,
            "file_name": resume.file_name,
            "uploaded_at": resume.uploaded_at
        },
        "applied_at": application.applied_at
    }

@router.patch("/{application_id}")
def update_application_status(
    application_id: int,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    allowed_statuses = {
        "Under Review",
        "Shortlisted",
        "Rejected"
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    result = (
        db.query(Application, Job)
        .join(
            Job,
            Application.job_id == Job.job_id
        )
        .filter(
            Application.application_id == application_id,
            Job.created_by == current_user.id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Application not found or you are not authorized"
        )

    application, job = result

    application.status = status_data.status

    db.commit()
    db.refresh(application)

    return {
        "message": "Application status updated successfully",
        "application_id": application.application_id,
        "status": application.status
    }

@router.get("/{application_id}/resume")
def view_application_resume(
    application_id: int,
    current_user: User = Depends(require_hr),
    db: Session = Depends(get_db)
):

    result = (
        db.query(Application, Job, Resume)
        .join(
            Job,
            Application.job_id == Job.job_id
        )
        .join(
            Resume,
            Application.resume_id == Resume.resume_id
        )
        .filter(
            Application.application_id == application_id,
            Job.created_by == current_user.id
        )
        .first()
    )

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Application or resume not found"
        )

    application, job, resume = result

    return Response(
        content=resume.file_data,
        media_type=resume.file_type,
        headers={
            "Content-Disposition": (
                f'inline; filename="{resume.file_name}"'
            )
        }
    )