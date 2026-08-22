from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()
def extract_topics(text_content: str):

    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("BASE_URL"),
    )

    system_prompt = """
    You are an expert document structure analyzer.

    Analyze the provided document text and identify its major topics.

    For every topic:
    1. Give it a concise and descriptive name.
    2. Assign its sequential order starting from 1.
    3. Identify the page where the topic begins.
    4. Identify the last page containing content belonging to that topic.

    IMPORTANT:
    - The document contains page markers such as [PAGE 1], [PAGE 2], etc.
    - Use these page markers to determine start_page and end_page.
    - Do not invent or estimate page numbers.
    - Preserve the order in which topics appear in the document.
    - Do not create duplicate topics.
    - Focus on meaningful major topics rather than every small subsection.

    Return the result as JSON in this format:

    {
        "topics": [
            {
                "name": "Topic name",
                "order": 1,
                "start_page": 1,
                "end_page": 3
            }
        ]
    }
    """

    response = client.chat.completions.create(
        model="gemini-3.5-flash-lite",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text_content},
        ],
        response_format={"type": "json_object"}
    )

    raw_result = response.choices[0].message.content

    result = json.loads(raw_result)



    return result
