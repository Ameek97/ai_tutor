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