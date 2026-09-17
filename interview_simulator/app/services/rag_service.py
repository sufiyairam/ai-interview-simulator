from collections import Counter
from pathlib import Path
import re


# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Folder containing our knowledge files
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"


class RAGService:
    def __init__(self):
        # Store knowledge-base chunks in memory.
        # This is much lighter than loading Sentence Transformers + ChromaDB.
        self.documents = []
        self._loaded = False

    def _tokenize(self, text: str) -> list[str]:
        """
        Convert text into simple lowercase word tokens.
        """
        return re.findall(r"\b[a-zA-Z0-9_+#.-]+\b", text.lower())

    def load_knowledge_base(self) -> int:
        """
        Read all .txt files from the knowledge_base folder
        and store their text chunks in memory.
        """

        documents = []

        for file_path in KNOWLEDGE_BASE_DIR.glob("*.txt"):

            # Read the knowledge file
            text = file_path.read_text(
                encoding="utf-8"
            )

            # Split content into smaller paragraphs
            chunks = [
                chunk.strip()
                for chunk in text.split("\n\n")
                if chunk.strip()
            ]

            for index, chunk in enumerate(chunks):

                documents.append(
                    {
                        "id": f"{file_path.stem}_{index}",
                        "text": chunk,
                        "source": file_path.name,
                        "tokens": Counter(
                            self._tokenize(chunk)
                        ),
                    }
                )

        self.documents = documents
        self._loaded = True

        return len(documents)

    def retrieve_context(
        self,
        query: str,
        n_results: int = 3,
    ) -> str:
        """
        Retrieve the most relevant knowledge-base chunks
        using lightweight keyword matching.
        """

        # Load the knowledge base the first time it is needed.
        if not self._loaded:
            self.load_knowledge_base()

        if not self.documents:
            return ""

        query_tokens = Counter(
            self._tokenize(query)
        )

        if not query_tokens:
            return ""

        scored_documents = []

        for document in self.documents:

            score = 0.0

            for token, query_count in query_tokens.items():

                document_count = document["tokens"].get(
                    token,
                    0,
                )

                if document_count > 0:
                    score += query_count * document_count

            if score > 0:
                scored_documents.append(
                    (
                        score,
                        document,
                    )
                )

        # Sort from most relevant to least relevant.
        scored_documents.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        selected_documents = [
            document
            for _, document in scored_documents[:n_results]
        ]

        if not selected_documents:
            return ""

        return "\n\n".join(
            document["text"]
            for document in selected_documents
        )


# Create one reusable RAG service instance
rag_service = RAGService()