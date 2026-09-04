# Legacy one-off collection bootstrap. The live RAG path uses rag_store.py
# and the canonical collection name defined there. Do not import this module
# from the FastAPI server.
from qdrant_client import QdrantClient, models

client = QdrantClient(
    url="http://localhost:6333"
)

client.create_collection(
    collection_name="ai_tutor",
    vectors_config=models.VectorParams(
        size=3072,
        distance=models.Distance.COSINE
    )
)