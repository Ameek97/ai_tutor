import logging
import os

from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models

load_dotenv()

logger = logging.getLogger("chat")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "ai_tutor")
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 3072
RETRIEVAL_K = 3
# Cosine similarity from LangChain/Qdrant; keep conservative so valid
# course questions still retrieve. Empty/unrelated hits tend to be lower.
MIN_RETRIEVAL_SCORE = 0.45

_embeddings = None
_qdrant_client = None
_vector_store = None


def get_qdrant_client():
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(url=QDRANT_URL)
    return _qdrant_client


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is missing")
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            google_api_key=api_key,
        )
    return _embeddings


def collection_exists(name=COLLECTION_NAME):
    client = get_qdrant_client()
    return any(collection.name == name for collection in client.get_collections().collections)


def ensure_collection():
    client = get_qdrant_client()
    if collection_exists():
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config={
            "": models.VectorParams(
                size=EMBEDDING_DIMENSION,
                distance=models.Distance.COSINE,
            )
        },
    )
    logger.info("[CHAT] Created Qdrant collection %s", COLLECTION_NAME)


def get_vector_store():
    global _vector_store
    ensure_collection()
    if _vector_store is None:
        _vector_store = QdrantVectorStore.from_existing_collection(
            embedding=get_embeddings(),
            collection_name=COLLECTION_NAME,
            url=QDRANT_URL,
            prefer_grpc=False,
        )
    return _vector_store


def course_filter(user_id, course_id):
    return models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.course_id",
                match=models.MatchValue(value=str(course_id)),
            ),
            models.FieldCondition(
                key="metadata.user_id",
                match=models.MatchValue(value=str(user_id)),
            ),
        ]
    )


def document_filter(user_id, course_id, document_id):
    return models.Filter(
        must=[
            models.FieldCondition(
                key="metadata.user_id",
                match=models.MatchValue(value=str(user_id)),
            ),
            models.FieldCondition(
                key="metadata.course_id",
                match=models.MatchValue(value=str(course_id)),
            ),
            models.FieldCondition(
                key="metadata.document_id",
                match=models.MatchValue(value=str(document_id)),
            ),
        ]
    )


def delete_points(qdrant_filter):
    if not collection_exists():
        return
    get_qdrant_client().delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.FilterSelector(filter=qdrant_filter),
    )
