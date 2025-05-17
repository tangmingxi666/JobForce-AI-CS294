import os
import openai
import json
from pathlib import Path
from typing import Dict

# Set your OpenAI API key here or via environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")


def llm_parse_resume(markdown_text: str) -> Dict[str, str]:
    prompt = f"""
You are an intelligent assistant for structured resume parsing. You will receive a Markdown-formatted resume and your task is to extract key experiences and return a structured JSON dictionary. Use the following format:

{{
  "Education_1": "A concise summary of an education experience",
  "Internship_1": "An internship bullet point",
  "Project_1": "A project description",
  "Skills_1": "Skill set descriptions",
  "Activity_1": "Extracurricular or club involvement"
}}

Guidelines:
- Extract all sections if present (Education, Experience, Projects, Skills, Activities).
- Each bullet should be concise and informative (30–60 words).
- Each key should begin with a category prefix and an index, e.g., Education_1.
- Return valid, flat JSON only. Do not include Markdown, extra commentary, or newlines inside values.

Resume content:
```
{markdown_text}
```
"""

    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    text = response.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        print("⚠️ Failed to parse response as JSON. Original response:")
        print(text)
        raise e


# CLI usage
if __name__ == "__main__":
    input_path = "output.txt"  # Replace with your input Markdown file
    raw_text = Path(input_path).read_text(encoding="utf-8")
    parsed_resume = llm_parse_resume(raw_text)

    output_path = "parsed_resume.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed_resume, f, ensure_ascii=False, indent=2)

    print(f"✅ Parsed resume saved to {output_path}")