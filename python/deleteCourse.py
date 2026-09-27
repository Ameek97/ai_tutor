from qdrant_client import QdrantClient, models

client = QdrantClient(
    url="http://localhost:6333"
)


def deleteCourse(payload):
    course_id = payload.course_id
    user_id = payload.user_id

    client.delete(
        collection_name="ai_tutor",
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.course_id",
                        match=models.MatchValue(
                            value=course_id
                        )
                    ),
                    models.FieldCondition(
                        key="metadata.user_id",
                        match=models.MatchValue(
                            value=user_id
                        )
                    )
                ]
            )
        )
    )

    return {
        "status": "success",
        "message":"the content was deleted. "
    }