from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from get_topics import get_topics
from rq_client import que
from worker import process_query

load_dotenv()

app = FastAPI()


class ExtractTopicsRequest(BaseModel):
    document_id: str
    course_id: str
    pdf_url: str

class uploadSmRequest(BaseModel):
    user_id:str
    course_id: str
    pdf_url: str

@app.get("/")
def root():
    print("hello")
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
    print("ROUTE STARTED")

    try:
        topics = get_topics(payload.pdf_url)

    except Exception as exc:
        print("ERROR:", exc)
        
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        ) from exc

    print("TOPICS EXTRACTED")
    print("TOPICS:", topics)

    return {
        "document_id": payload.document_id,
        "course_id": payload.course_id,
        "topics": topics,
    }


@app.post("/upload-study-material")
def upload_study_material(payload:uploadSmRequest):

      try:
        result = uploadMaterial(payload.pdf_url)


      except Exception as err:
          print("Error:",err)

          raise HTTPException(
        status_code=500,
        detail="Internal server error"
       ) from exc

      return {
        result
    }