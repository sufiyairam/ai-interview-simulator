from app.services.rag_service import rag_service


print("Loading knowledge base...")

count = rag_service.load_knowledge_base()

print(f"Loaded {count} knowledge chunks.")


query = "How does FastAPI dependency injection work?"

print("\nSearching for relevant information...\n")

context = rag_service.retrieve_context(
    query=query,
    n_results=3,
)

print(context)