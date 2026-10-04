from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.resume import Resume
from app.models.user import User

from app.routers.auth import require_candidate

from app.services.resume_parser import extract_text_from_pdf
from app.services.skill_extractor import extract_skills

from app.services.resume_classifier import predict_category

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)

from fastapi.responses import Response

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):

    # 1. Validate file type
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    # 2. Read PDF file
    file_data = await file.read()

    # 3. Check that file is not empty
    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    extracted_text = extract_text_from_pdf(file_data)

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the PDF"
        )

    predicted_category = predict_category(extracted_text)
    resume_skills = extract_skills(extracted_text)
    skills_text = ", ".join(resume_skills)

    # 4. Mark previous current resume as not current
    db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_current == True
    ).update(
        {
            Resume.is_current: False
        }
    )
    # 5. Create new resume
    new_resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        file_type=file.content_type,
        file_data=file_data,
        extracted_text=extracted_text,
        skills=skills_text,
        is_current=True
    )

    # 6. Save to database
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": new_resume.resume_id,
        "file_name": new_resume.file_name,
        "predicted_category": predicted_category,
        "is_current": new_resume.is_current
    }
@router.get("/current")
def get_current_resume(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):

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
            status_code=404,
            detail="No resume found"
        )

    return {
        "resume_id": resume.resume_id,
        "file_name": resume.file_name,
        "file_type": resume.file_type,
        "uploaded_at": resume.uploaded_at,
        "is_current": resume.is_current
    }
@router.get("/{resume_id}/view")
def view_resume(
    resume_id: int,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db)
):

    resume = (
        db.query(Resume)
        .filter(
            Resume.resume_id == resume_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    return Response(
        content=resume.file_data,
        media_type=resume.file_type,
        headers={
            "Content-Disposition": f'inline; filename="{resume.file_name}"'
        }
    )