import logging
import os
import tempfile

import requests
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag_store import (
    COLLECTION_NAME,
    delete_points,
    document_filter,
    get_vector_store,
)

load_dotenv()

logger = logging.getLogger("chat")

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def upload_study_material(payload):
    temp_path = None

    try:
        logger.info(
            "[CHAT] Ingestion started collection=%s course_id=%s document_id=%s",
            COLLECTION_NAME,
            payload.course_id,
            payload.document_id,
        )

        response = requests.get(payload.pdf_url, timeout=60)
        response.raise_for_status()

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            tmp_file.write(response.content)
            temp_path = tmp_file.name

        loader = PyPDFLoader(file_path=temp_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )
        texts = text_splitter.split_documents(docs)

        for text in texts:
            text.metadata.update(
                {
                    "course_id": str(payload.course_id),
                    "user_id": str(payload.user_id),
                    "document_id": str(payload.document_id),
                    "topic": text.metadata.get("topic", ""),
                    "chapter": text.metadata.get("chapter", ""),
                }
            )

        delete_points(
            document_filter(
                payload.user_id,
                payload.course_id,
                payload.document_id,
            )
        )

        if not texts:
            logger.info("[CHAT] Ingestion produced no chunks")
            return {
                "status": "success",
                "message": "no text chunks were extracted from the document",
                "chunks": 0,
                "collection": COLLECTION_NAME,
            }

        get_vector_store().add_documents(texts)

        logger.info(
            "[CHAT] Ingestion complete chunks=%s collection=%s",
            len(texts),
            COLLECTION_NAME,
        )

        return {
            "status": "success",
            "message": "the content was added.",
            "chunks": len(texts),
            "collection": COLLECTION_NAME,
        }
    except Exception as exc:
        logger.exception("[CHAT] Ingestion failed: %s", type(exc).__name__)
        raise
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def delete_study_material_vectors(payload):
    delete_points(
        document_filter(
            payload.user_id,
            payload.course_id,
            payload.document_id,
        )
    )
    return {
        "status": "success",
        "message": "document vectors were deleted.",
        "collection": COLLECTION_NAME,
    }


def delete_course_vectors(payload):
    delete_points(course_filter(payload.user_id, payload.course_id))
    return {
        "status": "success",
        "message": "the content was deleted.",
        "collection": COLLECTION_NAME,
    }
