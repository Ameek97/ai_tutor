from rag_store import COLLECTION_NAME, course_filter, delete_points


def deleteCourse(payload):
    delete_points(course_filter(payload.user_id, payload.course_id))
    return {
        "status": "success",
        "message": "the content was deleted.",
        "collection": COLLECTION_NAME,
    }
