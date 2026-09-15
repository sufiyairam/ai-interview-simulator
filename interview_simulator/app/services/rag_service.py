from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Folder containing our knowledge files
KNOWLEDGE_BASE_DIR = BASE_DIR / "knowledge_base"

# Folder where ChromaDB will store vector data
CHROMA_DB_DIR = BASE_DIR / "chroma_db"


class RAGService:
    def __init__(self):
        # Load the embedding model
        self.embedding_model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        # Create a persistent ChromaDB client
        self.client = chromadb.PersistentClient(
            path=str(CHROMA_DB_DIR)
        )

        # Get or create our collection
        self.collection = self.client.get_or_create_collection(
            name="interview_knowledge"
        )

    def load_knowledge_base(self):
        """
        Read all .txt files from the knowledge_base folder
        and store them in ChromaDB.
        """

        documents = []
        ids = []
        metadatas = []

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

                document_id = (
                    f"{file_path.stem}_{index}"
                )

                documents.append(chunk)
                ids.append(document_id)

                metadatas.append(
                    {
                        "source": file_path.name
                    }
                )

        # Only add documents if files were found
        if documents:

            embeddings = self.embedding_model.encode(
                documents
            ).tolist()

            # Store documents and embeddings
            self.collection.upsert(
                documents=documents,
                embeddings=embeddings,
                ids=ids,
                metadatas=metadatas,
            )

        return len(documents)

    def retrieve_context(
        self,
        query: str,
        n_results: int = 3,
    ) -> str:
        """
        Search the knowledge base and return
        the most relevant information.
        """

        query_embedding = self.embedding_model.encode(
            query
        ).tolist()

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )

        documents = results.get("documents", [[]])

        if not documents or not documents[0]:
            return ""

        return "\n\n".join(documents[0])


# Create one reusable RAG service instance
rag_service = RAGService()