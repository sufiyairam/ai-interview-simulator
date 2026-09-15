import json
import re

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.services.llm_provider import get_chat_model
from app.services.rag_service import rag_service


QUESTION_GEN_SYSTEM_PROMPT = """You are a senior technical interviewer.

Given a job description and relevant technical knowledge from a knowledge base,
generate {num_questions} interview questions that probe the candidate's real
alignment with the role.

Use the job description as the primary source for understanding the role.

Use the retrieved knowledge only when it is relevant to create technically
accurate and grounded questions.

Include a balanced mix of:
- Technical questions
- Problem-solving questions
- Behavioral questions
- Role-specific questions

Vary the difficulty appropriately.

Return ONLY a JSON array of objects.
Do not include explanations, prose, markdown, or code fences.

Use exactly this format:

[
  {{"question": "...", "skill_tag": "..."}}
]

skill_tag should be a short 1-3 word label such as:
"python", "debugging", "rest api", "communication", or "problem solving".
"""


ANSWER_ANALYSIS_SYSTEM_PROMPT = """You are an expert interview coach evaluating a junior or entry-level candidate.

You are given:
- The original interview question
- The job description context
- Relevant technical knowledge retrieved from a knowledge base
- The candidate's answer

Evaluate how well the candidate answered the specific question asked.

Use the retrieved technical knowledge as supporting context when it is relevant.
Do not require the candidate to mention every detail from the retrieved context.

Score the answer from 0 to 100 based primarily on:
- Relevance to the question
- Technical correctness
- Clarity and structure
- Specificity and useful examples
- Alignment with the job description

Important evaluation rules:

1. Focus only on what the interviewer actually asked.
Do not penalize the candidate for failing to discuss unrelated advanced topics.

2. Carefully read the candidate's answer before giving feedback.
Do not suggest that they add something they have already clearly mentioned.

3. Evaluate the candidate appropriately for a junior or entry-level role.
Do not expect senior-level production architecture unless the question asks for it.

4. Do NOT encourage the candidate to invent:
- Metrics
- Percentages
- Achievements
- Professional experience
- Project results they did not actually measure

5. Only suggest additional details if they would genuinely make the answer
more accurate, relevant, or convincing.

6. Do not give generic suggestions such as "add more technical details"
unless you clearly specify which relevant detail is missing.

7. The feedback must include:
- One specific strength from the candidate's answer.
- One or two specific improvements relevant to the exact question.

8. If the answer already covers a topic, do not criticize the candidate
for not mentioning that same topic.

9. Keep the feedback constructive, realistic, and suitable for helping
the candidate improve their interview skills.

Return ONLY valid JSON.
Do not include markdown, explanations, or code fences.

Use exactly this format:

{{"alignment_score": <number from 0 to 100>, "feedback": "..."}}
"""


def _strip_code_fences(text: str) -> str:
    """
    Remove markdown code fences if the LLM adds them.
    """

    cleaned = text.strip()

    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    return cleaned.strip()


def _extract_json_array(text: str) -> str:
    """
    Extract a JSON array from an LLM response.

    This handles responses where the model adds extra text before
    or after the JSON array.
    """

    start = text.find("[")
    end = text.rfind("]")

    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON array found in LLM response")

    return text[start : end + 1]


def _extract_json_object(text: str) -> str:
    """
    Extract a JSON object from an LLM response.

    This handles responses where the model adds extra text before
    or after the JSON object.
    """

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in LLM response")

    return text[start : end + 1]


def generate_interview_questions(
    job_description_text: str,
    num_questions: int = 5,
) -> list[dict]:
    """
    Generates interview questions using both the job description
    and relevant context retrieved from the RAG knowledge base.
    """

    # Retrieve relevant technical knowledge for question generation.
    rag_context = rag_service.retrieve_context(
        query=job_description_text,
        n_results=5,
    )

    model = get_chat_model(temperature=0.4)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", QUESTION_GEN_SYSTEM_PROMPT),
            (
                "human",
                "Job description:\n\n{job_description}\n\n"
                "Relevant technical knowledge from the knowledge base:\n\n"
                "{rag_context}",
            ),
        ]
    )

    chain = prompt | model | StrOutputParser()

    raw = chain.invoke(
        {
            "num_questions": num_questions,
            "job_description": job_description_text,
            "rag_context": rag_context,
        }
    )

    try:
        cleaned = _strip_code_fences(raw)
        json_text = _extract_json_array(cleaned)
        parsed = json.loads(json_text)

    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(
            f"LLM did not return valid JSON for questions: {raw!r}"
        ) from e

    if not isinstance(parsed, list):
        raise ValueError(
            "LLM response for questions was not a JSON array"
        )

    questions = []

    for item in parsed[:num_questions]:
        if not isinstance(item, dict):
            continue

        question = str(
            item.get("question", "")
        ).strip()

        skill_tag = str(
            item.get("skill_tag", "general")
        ).strip()

        if question:
            questions.append(
                {
                    "question": question,
                    "skill_tag": skill_tag or "general",
                }
            )

    if not questions:
        raise ValueError(
            "LLM returned no valid interview questions"
        )

    return questions


def analyze_answer(
    question_text: str,
    job_description_text: str,
    transcript: str,
) -> dict:
    """
    Scores a candidate's answer using the interview question,
    job description, and relevant technical knowledge from RAG.
    """

    # Search the knowledge base using the interview question.
    rag_context = rag_service.retrieve_context(
        query=question_text,
        n_results=5,
    )

    model = get_chat_model(temperature=0.2)

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", ANSWER_ANALYSIS_SYSTEM_PROMPT),
            (
                "human",
                "Job description:\n{job_description}\n\n"
                "Relevant technical knowledge from the knowledge base:\n"
                "{rag_context}\n\n"
                "Interview question:\n{question}\n\n"
                "Candidate's answer:\n{transcript}",
            ),
        ]
    )

    chain = prompt | model | StrOutputParser()

    raw = chain.invoke(
        {
            "job_description": job_description_text,
            "rag_context": rag_context,
            "question": question_text,
            "transcript": transcript,
        }
    )

    try:
        cleaned = _strip_code_fences(raw)
        json_text = _extract_json_object(cleaned)
        parsed = json.loads(json_text)

    except (json.JSONDecodeError, ValueError) as e:
        raise ValueError(
            f"LLM did not return valid JSON for analysis: {raw!r}"
        ) from e

    if not isinstance(parsed, dict):
        raise ValueError(
            "LLM response for analysis was not a JSON object"
        )

    try:
        alignment_score = float(
            parsed.get("alignment_score", 0)
        )

    except (TypeError, ValueError):
        alignment_score = 0

    # Ensure the score always stays between 0 and 100.
    alignment_score = max(
        0,
        min(100, alignment_score),
    )

    feedback = str(
        parsed.get("feedback", "")
    ).strip()

    return {
        "alignment_score": alignment_score,
        "feedback": feedback,
    }