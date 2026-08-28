from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()


def queryAgent(related_text, query: str):

    print("reached llm")

    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("BASE_URL"),
    )

    text_content = "\n\n".join(
        doc.page_content for doc in related_text
    )

    system_prompt = f"""
Answer the user's question using the provided study material.
If the answer is not present in the study material, say that the information
is not available in the provided material.


"""



    user_prompt = f"""
      Study material: {text_content}

    Student question: {query}
"""


    response = client.chat.completions.create(
        model="gemini-3.5-flash-lite",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"}
    )

    raw_result = response.choices[0].message.content

    result = json.loads(raw_result)

    print("returning the result from llm")

    return result
