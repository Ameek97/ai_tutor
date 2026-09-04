import logging
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field, field_validator, model_validator

from ansQuery import ansQuery
from deleteCourse import deleteCourse
from get_topics import get_topics
from rq_client import que
from upload_study_material import (
    delete_study_material_vectors,
    upload_study_material,
)
from worker import process_query

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("chat")

OBJECT_ID_PATTERN = re.compile(r"^[a-fA-F0-9]{24}$")

app = FastAPI()


def validate_object_id(value: str, field_name: str) -> str:
    trimmed = (value or "").strip()
    if not OBJECT_ID_PATTERN.fullmatch(trimmed):
        raise ValueError(f"{field_name} must be a 24-character hex id")
    return trimmed


class deleteCourseRequest(BaseModel):
    user_id: str
    course_id: str

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, value):
        return validate_object_id(value, "user_id")

    @field_validator("course_id")
    @classmethod
    def validate_course_id(cls, value):
        return validate_object_id(value, "course_id")


class deleteDocumentRequest(BaseModel):
    user_id: str
    course_id: str
    document_id: str

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, value):
        return validate_object_id(value, "user_id")

    @field_validator("course_id")
    @classmethod
    def validate_course_id(cls, value):
        return validate_object_id(value, "course_id")

    @field_validator("document_id")
    @classmethod
    def validate_document_id(cls, value):
        return validate_object_id(value, "document_id")


class ExtractTopicsRequest(BaseModel):
    document_id: str
    course_id: str
    pdf_url: str


class uploadSmRequest(BaseModel):
    user_id: str
    course_id: str
    document_id: str
    pdf_url: str

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, value):
        return validate_object_id(value, "user_id")

    @field_validator("course_id")
    @classmethod
    def validate_course_id(cls, value):
        return validate_object_id(value, "course_id")

    @field_validator("document_id")
    @classmethod
    def validate_document_id(cls, value):
        return validate_object_id(value, "document_id")

    @field_validator("pdf_url")
    @classmethod
    def validate_pdf_url(cls, value):
        if not (value or "").strip():
            raise ValueError("pdf_url must not be empty")
        return value.strip()


class Message(BaseModel):
    role: str
    message: str


class QueryRequest(BaseModel):
    user_id: str
    course_id: str
    messages: list[Message] = Field(min_length=1)

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, value):
        return validate_object_id(value, "user_id")

    @field_validator("course_id")
    @classmethod
    def validate_course_id(cls, value):
        return validate_object_id(value, "course_id")

    @model_validator(mode="after")
    def validate_latest_message(self):
        latest = self.messages[-1].message
        if latest is None or not str(latest).strip():
            raise ValueError("latest message must not be empty")
        return self


@app.get("/")
def root():
    return {"status": "app is running"}


@app.get("/query")
def fn(
    query: str = Query(..., description="this is the query")
):
    job = que.enqueue(process_query, query)

    return {
        "status": "queued",
        "job-id": job.id
    }


@app.post("/extract-topics")
def extract_topics_route(payload: ExtractTopicsRequest):
    logger.info("[CHAT] extract-topics started")

    try:
        topics = get_topics(payload.pdf_url)
    except Exception as exc:
        logger.exception("[CHAT] extract-topics failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=500,
            detail="internal server error",
        ) from exc

    return {
        "document_id": payload.document_id,
        "course_id": payload.course_id,
        "topics": topics,
    }


@app.post("/upload-study-material")
def upload_sm(payload: uploadSmRequest):
    try:
        return upload_study_material(payload)
    except Exception as err:
        logger.exception("[CHAT] upload-study-material failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        ) from err


def _delete_course(payload: deleteCourseRequest):
    try:
        return deleteCourse(payload)
    except Exception as err:
        logger.exception("[CHAT] delete-course failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        ) from err


@app.delete("/delete-course")
def delete_course_route(payload: deleteCourseRequest):
    return _delete_course(payload)


@app.delete("/deleteCouse")
def delete_course_legacy_route(payload: deleteCourseRequest):
    return _delete_course(payload)


@app.delete("/delete-document")
def delete_document_route(payload: deleteDocumentRequest):
    try:
        return delete_study_material_vectors(payload)
    except Exception as err:
        logger.exception("[CHAT] delete-document failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        ) from err


@app.post("/userQuery")
def ans_Query(payload: QueryRequest):
    try:
        result = ansQuery(payload)
    except HTTPException:
        raise
    except Exception as err:
        logger.exception("[CHAT] userQuery failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=500,
            detail="internal server error",
        ) from err

    if isinstance(result, dict) and "answer" in result:
        return {"answer": result["answer"]}

    if isinstance(result, str):
        return {"answer": result}

    return {"answer": str(result)}
