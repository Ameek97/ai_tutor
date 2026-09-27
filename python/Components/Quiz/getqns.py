from langchain_qdrant import QdrantVectorStore
from qdrant_client.http import models

vector_store = QdrantVectorStore.from_existing_collection(
    embedding=embeddings,
    collection_name="my_documents",
    url="http://localhost:6333",
)


def getQuizQns(payload):

    user_id = payload.userid
    doc_id = payload.doc_id
    topics = payload.topics

    query = ", ".join(topics)

    try:
        related_text = vector_store.similarity_search(
            query=query,
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="courseId",
                        match=models.MatchValue(value=doc_id),
                    ),
                    models.FieldCondition(
                        key="userId",
                        match=models.MatchValue(value=user_id),
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