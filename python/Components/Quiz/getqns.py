import os

from fastapi import HTTPException
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import models
from Components.Quiz.quizllm import quizQnLLM




def getQuizQns(payload):
    embedding_model = GoogleGenerativeAIEmbeddings(
        model="gemini-embedding-001",
        google_api_key=os.getenv("GEMINI_API_KEY"),
    )

    vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embedding_model,
        collection_name="ai_tutor",
        url="http://localhost:6333",
    )

    topics = payload.topics
    user_id = payload.user_id
    course_id = payload.course_id
    doc_id = payload.doc_id

    query = ", ".join(topics)

    try:
        related_text = vector_store.similarity_search(
            query=query,
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.course_id",
                        match=models.MatchValue(value=course_id),
                    ),
                    models.FieldCondition(
                        key="metadata.user_id",
                        match=models.MatchValue(value=user_id),
                    ),
                    models.FieldCondition(
                        key="metadata.document_id",
                        match=models.MatchValue(value=doc_id),
                    ),
                ]
            ),
        )

        result = quizQnLLM(topics, related_text)

        return result

    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail="internal server error",
        ) from err