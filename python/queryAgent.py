import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

_llm_client = None


def get_llm_client():
    global _llm_client
    if _llm_client is None:
        api_key = os.getenv("API_KEY")
        base_url = os.getenv("BASE_URL")
        if not api_key:
            raise RuntimeError("API_KEY is missing")
        _llm_client = OpenAI(
            api_key=api_key,
            base_url=base_url,
        )
    return _llm_client


def queryAgent(related_text, messages):
    text_content = "\n\n".join(
        doc.page_content for doc in related_text if (doc.page_content or "").strip()
    )

    system_prompt = """
You are an AI tutor.

Answer the student's question using the provided study material and conversation history.

The uploaded study material is the primary source of truth. Use only the retrieved study material to answer. Do not invent or assume information that is not supported by that material.

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
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt,
        },
    ]

    llm_messages += [
        {
            "role": msg.role,
            "content": msg.message,
        }
        for msg in messages
    ]

    response = get_llm_client().chat.completions.create(
        model="gemini-3.5-flash-lite",
        messages=llm_messages,
    )

    raw_result = response.choices[0].message.content
    if not raw_result:
        return "I couldn't find this information in the uploaded study material."

    return raw_result
