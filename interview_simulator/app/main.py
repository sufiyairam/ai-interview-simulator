from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.interview_service import (
    generate_interview_questions,
    analyze_answer,
)


app = FastAPI(title="AI Virtual Interview Simulator")


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-interview-simulator-rose-theta.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.post("/users", response_model=schemas.UserOut)
def create_user(
    payload: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    if existing:
        return existing

    user = models.User(
        email=payload.email,
        full_name=payload.full_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ---------------------------------------------------------------------------
# Interview History
# ---------------------------------------------------------------------------

@app.get(
    "/users/{user_id}/interview-history",
    response_model=list[schemas.InterviewSessionOut],
)
def get_interview_history(
    user_id: str,
    db: Session = Depends(get_db),
):
    user = db.get(models.User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    sessions = (
        db.query(models.InterviewSession)
        .filter(models.InterviewSession.user_id == user_id)
        .order_by(
            models.InterviewSession.created_at.desc()
        )
        .all()
    )

    return sessions


# ---------------------------------------------------------------------------
# Job Descriptions
# ---------------------------------------------------------------------------

@app.post(
    "/job-descriptions",
    response_model=schemas.JobDescriptionOut,
)
def create_job_description(
    payload: schemas.JobDescriptionCreate,
    db: Session = Depends(get_db),
):
    user = db.get(
        models.User,
        payload.user_id,
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    jd = models.JobDescription(
        user_id=payload.user_id,
        title=payload.title,
        company=payload.company,
        raw_text=payload.raw_text,
    )

    db.add(jd)
    db.commit()
    db.refresh(jd)

    return jd


# ---------------------------------------------------------------------------
# Interview Sessions
# ---------------------------------------------------------------------------

@app.post(
    "/interview-sessions",
    response_model=schemas.InterviewSessionOut,
)
def create_interview_session(
    payload: schemas.InterviewSessionCreate,
    db: Session = Depends(get_db),
):
    jd = db.get(
        models.JobDescription,
        payload.job_description_id,
    )

    if not jd:
        raise HTTPException(
            status_code=404,
            detail="Job description not found",
        )

    # Generate interview questions using RAG + LLM
    try:
        generated = generate_interview_questions(
            jd.raw_text,
            num_questions=payload.num_questions,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Question generation failed: {e}",
        )

    if not generated:
        raise HTTPException(
            status_code=502,
            detail="LLM returned no questions",
        )

    # Create interview session
    session = models.InterviewSession(
        user_id=payload.user_id,
        job_description_id=payload.job_description_id,
        status=models.SessionStatus.in_progress,
    )

    db.add(session)

    # Get session ID before committing
    db.flush()

    # Save generated questions
    for idx, q in enumerate(generated):
        db.add(
            models.InterviewQuestion(
                session_id=session.id,
                order_index=idx,
                question_text=q["question"],
                skill_tag=q["skill_tag"],
            )
        )

    db.commit()
    db.refresh(session)

    return session


# ---------------------------------------------------------------------------
# Get Interview Session
# ---------------------------------------------------------------------------

@app.get(
    "/interview-sessions/{session_id}",
    response_model=schemas.InterviewSessionOut,
)
def get_interview_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    session = db.get(
        models.InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return session
# ---------------------------------------------------------------------------
# Delete Interview Session
# ---------------------------------------------------------------------------

@app.delete("/interview-sessions/{session_id}")
def delete_interview_session(
    session_id: str,
    db: Session = Depends(get_db),
):
    session = db.get(
        models.InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    db.delete(session)
    db.commit()

    return {
        "message": "Interview deleted successfully"
    }


# ---------------------------------------------------------------------------
# Answers
# ---------------------------------------------------------------------------

@app.post(
    "/answers",
    response_model=schemas.AnswerOut,
)
def submit_answer(
    payload: schemas.AnswerSubmit,
    db: Session = Depends(get_db),
):
    question = db.get(
        models.InterviewQuestion,
        payload.question_id,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    session = question.session
    jd = session.job_description

    # Analyze answer using RAG + LLM
    try:
        analysis = analyze_answer(
            question_text=question.question_text,
            job_description_text=jd.raw_text,
            transcript=payload.transcript,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Answer analysis failed: {e}",
        )

    answer = models.InterviewAnswer(
        question_id=question.id,
        transcript=payload.transcript,
        alignment_score=analysis["alignment_score"],
        feedback=analysis["feedback"],
    )

    db.add(answer)
    db.commit()
    db.refresh(answer)

    # Check whether the entire interview is complete
    _maybe_complete_session(
        session,
        db,
    )

    return answer


# ---------------------------------------------------------------------------
# Complete Interview Session
# ---------------------------------------------------------------------------

def _maybe_complete_session(
    session: models.InterviewSession,
    db: Session,
) -> None:
    """
    Once every question has an answer,
    calculate the overall score and mark
    the interview as completed.
    """

    db.refresh(session)

    questions = session.questions

    # Do nothing until every question has an answer
    if (
        not questions
        or any(q.answer is None for q in questions)
    ):
        return

    scores = [
        q.answer.alignment_score
        for q in questions
        if q.answer.alignment_score is not None
    ]

    overall = (
        sum(scores) / len(scores)
        if scores
        else None
    )

    session.overall_score = overall

    if overall is not None:
        session.overall_summary = (
            f"Completed {len(questions)} questions with an "
            f"average alignment score of {overall:.1f}/100."
        )
    else:
        session.overall_summary = "Completed."

    session.status = models.SessionStatus.completed

    session.completed_at = datetime.now(
        timezone.utc
    )

    db.add(session)
    db.commit()


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok"
    }