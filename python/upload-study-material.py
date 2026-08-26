import os
import tempfile

import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIembeddings 

def upload_study_material(pdf_url):
    temp_path = None

    try:
        print("reached get topics")
        response = requests.get(pdf_url, timeout=30)
        response.raise_for_status()

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            tmp_file.write(response.content)
            temp_path = tmp_file.name

        loader = PyPDFLoader(file_path=temp_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=0)
        texts = text_splitter.split_documents(docs)

        

    except Exception as exc:
        print(f"Error processing study material: {exc}")
        raise

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


    embedding_model = OpenAIembeddings( model  = "text-embedding-3-large")

    
vector_store = QdrantVectorStore.from_documents(
    documents = chunks,
    embedding= embedding_model,
    url="http://localhost:6333/",
    collection_name="ai_tutor"
)
    