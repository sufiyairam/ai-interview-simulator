from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import SessionStatus


# ---------- Users ----------

class UserCreate(BaseModel):
    email: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime


# ---------- Job Descriptions ----------

class JobDescriptionCreate(BaseModel):
    user_id: str
    title: str
    company: Optional[str] = None
    raw_text: str


class JobDescriptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    company: Optional[str] = None
    raw_text: str
    created_at: datetime


# ---------- Resumes ----------

class ResumeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    filename: str
    raw_text: str
    created_at: datetime


# ---------- Interview Sessions ----------

class InterviewSessionCreate(BaseModel):
    user_id: str
    job_description_id: str
    num_questions: int = 5


# ---------- Answers ----------

class AnswerSubmit(BaseModel):
    question_id: str
    transcript: str


class AnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    question_id: str
    transcript: str
    alignment_score: Optional[float] = None
    feedback: Optional[str] = None


# ---------- Interview Questions ----------

class InterviewQuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_index: int
    question_text: str
    skill_tag: Optional[str] = None
    answer: Optional[AnswerOut] = None


# ---------- Job Description Summary ----------

class JobDescriptionSummary(BaseModel):
    """
    A smaller version of the job description used
    inside interview session responses.
    """

    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    company: Optional[str] = None


# ---------- Interview Sessions ----------

class InterviewSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: SessionStatus
    overall_score: Optional[float] = None
    overall_summary: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    # Job information
    job_description: Optional[JobDescriptionSummary] = None

    # Questions and answers
    questions: list[InterviewQuestionOut] = []