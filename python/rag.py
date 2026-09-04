# Legacy local-PDF experiment. The live ingest/chat path is
# upload_study_material.py → rag_store.py → ansQuery.py.
from langchain_community.document_loaders import PyPDFLoader
from pathlib import Path   #to easily tell path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore



pdfPath = Path(__file__).parent/"mypdf.pdf"

loader = PyPDFLoader(file_path= pdfPath)

docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
       chunk_size = 1000,
       chunk_overlap = 400
)
# create chunks 
chunks = text_splitter.split_documents( documents=docs )


# select an embedding model
embedding_model = OpenAIEmbeddings(
    model = ""
)


vector_store = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embedding_model,
    url="http://localhost:6333/",
    collection_name="ai_tutor"
)