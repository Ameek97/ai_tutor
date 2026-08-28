from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()
def extract_topics(text_content: str):

    print("reached llm")

    client = OpenAI(
        api_key=os.getenv("API_KEY"),
        base_url=os.getenv("BASE_URL"),
    )

    system_prompt = """
    You are an expert syllabus/curriculum analyzer.

Analyze the provided syllabus text and identify its chapters (or units/modules)
and the topics listed under each chapter.a

For every chapter:
1. Give it a concise, descriptive name, exactly as it appears in the syllabus
   (or lightly cleaned up if the original has numbering clutter, e.g. "Unit
   3: Normalization" → "Normalization").
2. Assign its sequential order starting from 1, in the order chapters appear
   in the syllabus.

For every topic within a chapter:
1. Give it a concise, descriptive name, exactly as it appears in the syllabus.
2. Assign its sequential order starting from 1, restarting at 1 for each
   new chapter (do not continue numbering across chapters).

IMPORTANT:
- Preserve the order in which chapters and topics appear in the syllabus.
- Do not invent chapters or topics that are not present in the text.
- Do not create duplicate chapters or duplicate topics within the same chapter.
- Do not include page numbers, IDs, or any fields other than name and order.
- If a chapter has no clearly listed sub-topics, include it with an empty
  topics array — do not fabricate topics to fill it.
- Focus on the chapter/topic hierarchy as the syllabus presents it; do not
  add a third level of nesting even if the syllabus has further sub-bullets —
  fold those into the topic name or merge them into the nearest topic.

Return the result as JSON in this exact format, with no markdown formatting
and no explanation text before or after:

{
    "chapters": [
        {
            "name": "Chapter name",
            "order": 1,
            "topics": [
                { "name": "Topic name", "order": 1 },
                { "name": "Topic name", "order": 2 }
            ]
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

    print("returning the result from llm")

    return result
