
import os

from fastapi import HTTPException
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import models

from queryAgent import queryAgent

load_dotenv()
print(os.getenv("GEMINI_API_KEY"))

def ansQuery(payload):

    messages = payload.messages
    user_id = payload.user_id
    course_id = payload.course_id
    query = payload.messages[-1].message  # extracting the last message

    embedding_model = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=os.getenv("GEMINI_API_KEY")
        )

    # similarity search
    vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embedding_model,
        collection_name="ai_tutor",
        url="http://localhost:6333",
    )

   

    try:
        related_text = vector_store.similarity_search(
            query=query,
            k=3,
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="courseId",
                        match=models.MatchValue(value=course_id),
                    ),
                    models.FieldCondition(
                        key="userId",
                        match=models.MatchValue(value=user_id),
                    ),
                ]
            ),
        )

        result = queryAgent(related_text, messages)
        return result 


    except Exception as err:
        print("Error found --> ", err)
        raise HTTPException(
            status_code=500,
            detail="internal server error",
        ) from err

    

