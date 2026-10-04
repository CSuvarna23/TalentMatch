from pydantic import BaseModel


class JobCreate(BaseModel):
    job_title: str
    category: str | None = None
    description: str
    required_skills: str
    experience: str
    location: str


class JobUpdate(BaseModel):
    job_title: str
    category: str | None = None
    description: str
    required_skills: str
    experience: str
    location: str