from ollama import chat
from ollama import ChatResponse
import json
import re


# def clean_resume_v2(resume_text: str) -> str:
#     # Find the first occurrence of '##' and the last occurrence of '---'
#     first_hash_index = resume_text.find('---')
#     last_dash_index = resume_text.rfind('---')
#     # Slice the string from the first '##' to the last '---'
#     cleaned_resume = resume_text[first_hash_index:].strip()  # Cut the part before the first '##'
#
#     # Optionally, if you want to remove everything after the last '---', uncomment the following line:
#     cleaned_resume = cleaned_resume[:last_dash_index].strip()
#
#     return cleaned_resume

#
# def transfer_front(path_front_file):


def markdown_to_json(markdown: str) -> dict:
    lines = markdown.split("\n")
    result = {}
    section = None
    sub_section = None
    current_content = []

    for line in lines:
        line = line.strip()

        # Check for main section headers (##)
        if line.startswith("##"):
            # Save previous section content
            if section:
                result[section] = sub_section if sub_section else "\n".join(current_content).strip()
            section = line.strip("# ").strip()
            sub_section = None
            current_content = []

        # Check for bolded items (**text**)
        elif re.match(r"\*\*.*\*\*", line):
            # Save the content of the previous sub-section
            if sub_section:
                result[section][sub_section] = "\n".join(current_content).strip()
            sub_section = line.strip("*").strip()  # Remove '**' from the line to get the sub-section title
            current_content = []

        # Content lines (either normal text or bullet points)
        elif line.startswith("-") or line:
            current_content.append(line.strip("-").strip())

    # Save the last section and sub-section
    if sub_section:
        result[section][sub_section] = "\n".join(current_content).strip()
    elif section:
        result[section] = "\n".join(current_content).strip()

    return result
def extract_after_think(text: str) -> str:
    marker = "</think>"
    if marker in text:
        return text.split(marker, 1)[1].strip()
    else:
        return text
def resume_agent1(order,JD,docu_RESUME):
    #with open(docu_JD, 'r', encoding='utf-8') as file:
    job_description = JD
    with open(docu_RESUME, 'r', encoding='utf-8') as file:
      resume = file.read()
    system_prompt=("As a professional resume editor, revise my resume to closely align with the provided job "
                   "description (JD). Follow these guidelines: Precision Matching: Tailor the language, "
                   "skills, and achievements to mirror the JD’s keywords, tone, and core requirements—without adding any skills or experiences not originally present."
                   "Relevance First: Emphasize the most relevant projects, responsibilities, reframe existing experiences to align with the JD’s requirements whenever possible,"
                   "and quantifiable results while downplaying unrelated content."
                   "Conciseness: Use industry-specific terminology from the JD and keep wording concise and impactful. Avoid redundancy."
                   "Consistency: Preserve the original resume structure (e.g., reverse chronology, number of experiences in each section) and only refine the content."
                    "Output Format: Return the revised resume strictly with the original aspects and their orders"
                   "Deliverable: Provide only the final revised resume (no explanations or notes) ready for immediate submission.")

    response: ChatResponse = chat(model='deepseek-r1:8b', messages=[
      {
        'role': 'system',
        'content': system_prompt,
      },
      {
        'role': 'user',
        'content': f"""This is the job description：{job_description}""",
      },
      {
        'role': 'user',
        'content': f"""This is the original resume of the candidate in Markdown format：{resume}""",
      }
    ])
    print(response['message']['content'])
    # response_content=extract_after_think(response['message']['content'])
    #print(response.message.content)
    # if not response_content:
    #     raise ValueError("Ollama 返回的 JSON 为空")
    #
    # json_response = json.loads(response_content)

    # with open(f"output_resume/{order}_output.txt", "w", encoding="utf-8") as f:
    #   f.write(extract_after_think(response.message.content))
    with open(f"output_resume/jsons.txt", "w", encoding="utf-8") as f:
      f.write(extract_after_think(response.message.content))


# 读取 JSON 文件
with open('job_description/jobs.json', 'r', encoding='utf-8') as f:
    jd_json = json.load(f)

# 提取 job_position 和 job_description
positions = jd_json["job_position"]
descriptions =jd_json["job_description"]

# 遍历 job_position 和对应的 jd
for key in positions:
    position = positions[key]
    jd = descriptions.get(key, "No description available.")
    print(f"Job Position: {position}")
    resume_agent1(key,jd,docu_RESUME='resume.txt')
    print("-" * 50)

# json_result = markdown_to_json(markdown_text)
# Print the resulting JSON
# print(json.dumps(json_result, indent=2))