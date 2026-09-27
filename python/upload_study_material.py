import os
import tempfile
from dotenv import load_dotenv

import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from fastapi.responses import JSONResponse
from langchain_google_genai import GoogleGenerativeAIEmbeddings


load_dotenv()
print("GEMINI KEY LOADED:", bool(os.getenv("GEMINI_API_KEY")))
def upload_study_material(payload):
    temp_path = None

    try:
        print("reached upload material")

        response = requests.get(payload.pdf_url, timeout=30)
        response.raise_for_status()

        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as tmp_file:
            tmp_file.write(response.content)
            temp_path = tmp_file.name

        loader = PyPDFLoader(file_path=temp_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=100,
            chunk_overlap=0
        )

        texts = text_splitter.split_documents(docs)

        # Add metadata to each chunk
        # meta data is a fixed word from doc loader
        for text in texts:
            text.metadata.update({
                "course_id": payload.course_id,
                "user_id": payload.user_id
            })

      

        embedding_model = GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
            google_api_key=os.getenv("GEMINI_API_KEY")
        )

        QdrantVectorStore.from_documents(
            texts,
            embedding=embedding_model,
            url="http://localhost:6333/",
            prefer_grpc=True,
            collection_name="my_documents",
        )

         
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
        "message":"the content was added. "
            }
)
    except Exception as exc:
        print(f"Error processing study material: {exc}")
        raise

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)