from dotenv import load_dotenv
from fastapi import FastAPI, Query

from rq_client import que
from worker import process_query

load_dotenv()

app = FastAPI()

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