import os
import tempfile

import requests
from langchain_community.document_loaders import PyPDFLoader

from llm import extract_topics


def get_topics(pdf_url):
    tempPath = None
    
    print("reached")
    try:
        print("reached")
        response = requests.get(pdf_url, timeout=30)
        response.raise_for_status()

        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as tmp_file:
            tmp_file.write(response.content)
            tempPath = tmp_file.name

        loader = PyPDFLoader(file_path=tempPath)
        docs = loader.load()

        pages = []

        for doc in docs:
            page_number = int(doc.metadata["page"]) + 1
            pages.append(
                f"--- PAGE {page_number} ---\n{doc.page_content}"
            )

        updated_pages = "\n\n".join(pages)

        print("========== TEXT SENT TO LLM ==========")
        print(updated_pages)
        print("======================================")

        return extract_topics(updated_pages)

    finally:
        if tempPath and os.path.exists(tempPath):
            os.remove(tempPath)