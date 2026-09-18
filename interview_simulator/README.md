# 🚀 AI Virtual Interview Simulator

An AI-powered virtual interview platform that simulates a real technical interview using a candidate's **resume and job description**.

The system generates personalized interview questions, conducts voice-based interviews, converts spoken answers into text, evaluates answers using an LLM, and provides scores and detailed feedback.

---

## ✨ Features

- 📄 Resume upload
- 💼 Job description input
- 🎯 Personalized interview questions
- 🔎 RAG-based knowledge retrieval
- 🎤 Voice-based interview
- 🗣️ Speech-to-text conversion
- 🤖 AI-powered answer evaluation
- 📊 Answer scoring
- 💬 Personalized AI feedback
- 📈 Interview results
- 🕒 Interview history
- 🗄️ PostgreSQL database
- 🌐 Full-stack web application

---

## 🧠 How It Works

```text
Resume + Job Description
          ↓
   RAG / Retrieval
          ↓
Personalized AI Questions
          ↓
     Voice Interview
          ↓
    Speech-to-Text
          ↓
     AI Evaluation
          ↓
    Scores + Feedback
          ↓
   Results / History

The goal is to provide a personalized interview experience based on the candidate's background and the requirements of the job.

🏗️ Project Architecture
                    ┌─────────────────────┐
                    │      Candidate      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Next.js Frontend  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    └──────┬────────┬─────┘
                           │        │
                  ┌────────▼───┐ ┌──▼──────────┐
                  │ PostgreSQL │ │ LLM / RAG   │
                  │  Database  │ │  Pipeline   │
                  └────────────┘ └─────────────┘
🛠️ Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Browser Speech Recognition API
Backend
Python
FastAPI
SQLAlchemy
Alembic
Pydantic
Database
PostgreSQL
AI / Machine Learning
LangChain
Retrieval-Augmented Generation (RAG)
ChromaDB
Groq LLM
Ollama / Llama 3 for local development
Development & Deployment
Git
GitHub
Vercel
Render
🔄 Application Workflow
1. Candidate Setup

The candidate provides:

Resume
Job description

The resume is uploaded to the backend and stored for the interview session.

2. Personalized Question Generation

The system analyzes the resume and job description to generate interview questions relevant to the candidate.

Questions can focus on:

Programming
APIs
Databases
Projects
Technologies listed in the resume
Job-specific requirements
3. RAG-Based Retrieval

The system uses Retrieval-Augmented Generation to retrieve relevant technical knowledge from the knowledge base.

This helps provide more context when generating and evaluating interview questions and answers.

4. Voice Interview

The candidate can answer questions using their microphone.

The browser's speech recognition capability converts the spoken response into text.

5. AI Answer Evaluation

The transcript is sent to the backend.

The LLM evaluates the answer based on:

Relevance
Technical correctness
Clarity
Specificity
Job-description alignment
6. Results

After completing the interview, the system displays:

Individual answer scores
Overall score
AI-generated feedback
Interview history
🔎 Retrieval-Augmented Generation (RAG)

RAG stands for Retrieval-Augmented Generation.

Instead of asking the LLM to answer using only its general knowledge, the system first retrieves relevant information from a knowledge base.

User Question
      ↓
Retrieve Relevant Knowledge
      ↓
Provide Context to LLM
      ↓
Generate Response

The project contains a knowledge base with technical information related to technologies such as:

Python
FastAPI
PostgreSQL
REST APIs

This retrieved context is used during the AI interview workflow.

🤖 AI Answer Evaluation

The AI evaluator receives:

Interview Question
        +
Job Description
        +
Candidate Answer
        ↓
    LLM Evaluation
        ↓
Score + Feedback

The evaluator returns a structured result containing:

{
  "alignment_score": 75,
  "feedback": "..."
}

The score is based on how well the candidate's answer addresses the question and aligns with the expected technical and job-related requirements.

🗄️ Database Structure

The application uses PostgreSQL to store interview-related information.

Main entities include:

Users
  │
  ├── Job Descriptions
  │
  └── Interview Sessions
          │
          ├── Questions
          │
          └── Answers

The database is managed using:

SQLAlchemy
Alembic migrations
PostgreSQL
🔌 Backend API

The FastAPI backend provides endpoints for the main application workflow.

Examples include:

POST /users
POST /job-descriptions
POST /resumes
POST /interview-sessions
POST /answers

GET /interview-sessions/{id}
GET /health

Interactive API documentation is available through FastAPI Swagger UI.

📁 Project Structure
interview_simulator/
│
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   │
│   └── services/
│       ├── llm_provider.py
│       ├── interview_service.py
│       └── rag_service.py
│
├── alembic/
│   └── versions/
│
├── knowledge_base/
│   ├── fastapi.txt
│   ├── postgresql.txt
│   ├── python.txt
│   └── rest_api.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
│
├── screenshots/
│   ├── setup.png
│   ├── interview.png
│   ├── voice.png
│   ├── results.png
│   ├── ai-feedback.png
│   └── history.png
│
├── requirements.txt
├── alembic.ini
├── .env.example
└── README.md
💻 Running the Project Locally
Backend

Create and activate a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Create the .env file using .env.example as a reference.

Run database migrations:

python -m alembic upgrade head

Start the backend:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health
🌐 Frontend

Move into the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend:

http://localhost:3000
🔐 Environment Variables

Sensitive credentials should be stored in .env and should never be committed to GitHub.

Example:

DATABASE_URL=your_database_url

LLM_PROVIDER=groq

GROQ_API_KEY=your_api_key
GROQ_MODEL=your_model

For local development, Ollama can also be used:

LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3
🧠 Local Llama 3 Support

The project supports switching between different LLM providers.

For example:

LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3

This allows the application to use Llama 3 locally through Ollama without changing the main interview logic.

For deployment, the project uses a cloud LLM provider.

🚀 Deployment

The project is deployed using:

Frontend

Vercel

Backend

Render

Database

Neon PostgreSQL

The deployed application connects the frontend, backend, AI evaluation system, and database into one complete workflow.

📸 Screenshots
Home / Interview Setup
![Setup](screenshots/setup.png)

Interview
![Interview](screenshots/interview.png)

Voice Interview
![Voice Interview](screenshots/voice.png)

Results
![Results](screenshots/results.png)

AI Feedback
![AI Feedback](screenshots/ai-feedback.png)

Interview History
![History](screenshots/history.png)

🌐 Live Demo

AI Virtual Interview Simulator

📂 GitHub Repository

GitHub Repository

🔮 Future Enhancements

Possible future improvements include:

User authentication
Resume parsing improvements
More advanced speech recognition
Multiple interview modes
Adaptive difficulty
Interview analytics
More detailed performance dashboards
Support for additional LLM providers
Larger technical knowledge bases
🎓 What I Learned

Through this project, I learned about:

Full-stack application development
Next.js and React
FastAPI backend development
REST APIs
PostgreSQL databases
SQLAlchemy
Alembic migrations
Retrieval-Augmented Generation
LangChain
LLM integration
Prompt engineering
Speech-to-text systems
AI-based evaluation
Git and GitHub
Cloud deployment using Vercel and Render
📌 Project Summary

AI Virtual Interview Simulator is a full-stack AI application designed to help students and job seekers practice technical interviews.

It combines:

Resume + Job Description + RAG + LLM + Voice + AI Evaluation

to create a personalized interview experience and provide actionable feedback to candidates.

👩‍💻 Author

Sufiya Iram

Computer Science and Data Science Engineering Student