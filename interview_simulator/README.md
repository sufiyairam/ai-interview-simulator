# AI Virtual Interview Simulator — Backend

Generates custom interview questions from a job description, accepts transcribed
answers (from your WebRTC + speech-to-text front end), and scores alignment
via an LLM (OpenAI or local Llama-3 through Ollama).

## Setup

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: set DATABASE_URL, and either OPENAI_API_KEY or LLM_PROVIDER=ollama
```

Create the Postgres database (name must match DATABASE_URL):

```bash
createdb interview_simulator
```

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Docs at `http://localhost:8000/docs`.

## Flow

1. `POST /users` — create a user
2. `POST /job-descriptions` — save the job the user matched to (from your job-matcher step)
3. `POST /interview-sessions` — generates N tailored questions via LangChain for that job
4. Front end runs the interview: play each question, capture audio over WebRTC,
   run speech-to-text, then `POST /answers` with `{question_id, transcript}`
5. Each answer submission triggers alignment scoring; once every question in a
   session has an answer, the session auto-completes with an `overall_score`
6. `GET /interview-sessions/{id}` — poll for full session + question + score state

## Switching to local Llama-3 (Ollama)

```bash
# .env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3
```

No code changes needed — `app/services/llm_provider.py` swaps the LangChain
chat model transparently.

## Making future schema changes

```bash
# after editing app/models.py
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## Notes

- Speech-to-text and the WebRTC audio capture are expected to run **client-side**
  (e.g. Streamlit + a browser STT API, or Whisper locally) — this backend takes
  the resulting transcript, not raw audio, keeping the API provider-agnostic.
- All IDs are UUID strings (Postgres `uuid` columns), generated in Python so
  they're available before insert (needed to chain question → answer creation).
