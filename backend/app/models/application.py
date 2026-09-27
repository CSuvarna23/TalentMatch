from datetime import datetime

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Numeric
)

from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Application(Base):
    __tablename__ = "applications"

    application_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.job_id"),
        nullable=False
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Under Review"
    )

    match_score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False
    )
    matched_skills: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    missing_skills: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )
    applied_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )