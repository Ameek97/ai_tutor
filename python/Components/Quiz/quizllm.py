from openai import OpenAI
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel


    
load_dotenv()
def quizQnLLM(topics, related_text):

    print("reached llm")

    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("BASE_URL"),
    )

    text_content = "\n\n".join(
        doc.page_content for doc in related_text
    )

    prompt = f"""
You are an educational quiz generator.

Generate multiple-choice quiz questions based ONLY on the provided study material.

Topics:
{topics}

Study material:
{text_content}

Return exactly 10 questions in a JSON array.

Each question must have this structure:

{{
    "id": "q1",
    "question": "Question text",
    "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
    ],
    "correctAnswer": 3,
    "explanation": "Explanation of why the answer is correct.",
    "topic": "Topic name",
    "difficulty": "medium"
}}

Rules:
- Generate exactly 10 questions.
- Each question must have exactly 4 options.
- correctAnswer must be an integer from 1 to 4.
- correctAnswer represents the position of the correct option.
- Each question must belong to one of the provided topics.
- difficulty must be one of: "easy", "medium", "hard".
- Generate questions ONLY from the provided study material.
- Do not use outside knowledge.
- Avoid duplicate or nearly identical questions.
- Return ONLY valid JSON.
"""

    response = client.chat.completions.create(
        model="gemini-3.5-flash-lite",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    raw_result = response.choices[0].message.content

    return json.loads(raw_result)