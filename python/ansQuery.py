import logging
import time

from dotenv import load_dotenv
from fastapi import HTTPException

from queryAgent import queryAgent
from rag_store import (
    COLLECTION_NAME,
    MIN_RETRIEVAL_SCORE,
    RETRIEVAL_K,
    course_filter,
    get_embeddings,
    get_vector_store,
)

load_dotenv()

logger = logging.getLogger("chat")

EMPTY_MATERIAL_ANSWER = (
    "I couldn't find this information in the uploaded study material."
)


def _filter_by_score(hits):
    usable = []
    for document, score in hits:
        if score is None:
            continue
        if float(score) < MIN_RETRIEVAL_SCORE:
            continue
        if not (document.page_content or "").strip():
            continue
        usable.append(document)
    return usable


def ansQuery(payload):
    started = time.perf_counter()
    messages = payload.messages
    user_id = payload.user_id
    course_id = payload.course_id
    query = messages[-1].message.strip()

    logger.info("[CHAT] Request received")
    logger.info("[CHAT] Course ID: %s", course_id)
    logger.info("[CHAT] Collection: %s", COLLECTION_NAME)

    try:
        embed_started = time.perf_counter()
        query_vector = get_embeddings().embed_query(query)
        embedding_ms = int((time.perf_counter() - embed_started) * 1000)

        search_started = time.perf_counter()
        vector_store = get_vector_store()
        hits = vector_store.similarity_search_with_score_by_vector(
            embedding=query_vector,
            k=RETRIEVAL_K,
            filter=course_filter(user_id, course_id),
            score_threshold=MIN_RETRIEVAL_SCORE,
        )
        retrieval_ms = int((time.perf_counter() - search_started) * 1000)
        related_text = _filter_by_score(hits)

        logger.info("[CHAT] Embedding: %s ms", embedding_ms)
        logger.info(
            "[CHAT] Retrieved chunks: %s (Qdrant %s ms, min_score=%s)",
            len(related_text),
            retrieval_ms,
            MIN_RETRIEVAL_SCORE,
        )

        if not related_text:
            total_ms = int((time.perf_counter() - started) * 1000)
            logger.info("[CHAT] Empty retrieval; skipping LLM (%s ms total)", total_ms)
            return EMPTY_MATERIAL_ANSWER

        logger.info("[CHAT] LLM request started")
        llm_started = time.perf_counter()
        result = queryAgent(related_text, messages)
        llm_ms = int((time.perf_counter() - llm_started) * 1000)
        total_ms = int((time.perf_counter() - started) * 1000)

        logger.info("[CHAT] LLM response received (%s ms)", llm_ms)
        logger.info("[CHAT] Response returned (%s ms total)", total_ms)
        return result
    except HTTPException:
        raise
    except Exception as err:
        logger.exception("[CHAT] Query failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=500,
            detail="internal server error",
        ) from err
