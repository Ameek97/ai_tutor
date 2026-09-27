from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()


def queryAgent(related_text, messages):

    print("reached llm")

    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("BASE_URL"),
    )

    text_content = "\n\n".join(
        doc.page_content for doc in related_text
    )

    system_prompt = """
You are an AI tutor.

Answer the student's question using the provided study material and conversation history.

Use the study material as the primary source of truth. Do not invent or assume information that is not supported by the provided study material.

Use the conversation history to understand the context of the student's question, including references to previous messages.

If the answer cannot be determined from the provided study material, say that the information is not available in the provided material.

Return only the answer to the student's question. Do not return JSON, labels, metadata, or explanations about your reasoning.
"""

    user_prompt = f"""
Study material:

{text_content}
"""

    llm_messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ]

    llm_messages += [
        {
            "role": msg.role,
            "content": msg.message
        }
        for msg in messages
    ]

    response = client.chat.completions.create(
        model="gemini-3.5-flash-lite",
        messages=llm_messages
    )

    raw_result = response.choices[0].message.content

    print("returning the result from llm")

    return raw_result