"""
Provider-agnostic LLM factory.

Switch between:
- Groq cloud-hosted LLM
- Ollama local LLM
- OpenAI hosted LLM

using the LLM_PROVIDER environment variable.
"""

from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama
from langchain_groq import ChatGroq

from app.config import settings


def get_chat_model(temperature: float = 0.3):
    """
    Return the configured chat model based on LLM_PROVIDER.
    """

    if settings.llm_provider == "ollama":
        return ChatOllama(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            temperature=temperature,
        )

    if settings.llm_provider == "groq":
        return ChatGroq(
            api_key=settings.groq_api_key,
            model=settings.groq_model,
            temperature=temperature,
        )

    # Default: OpenAI
    return ChatOpenAI(
        api_key=settings.openai_api_key,
        model=settings.openai_model,
        temperature=temperature,
    )