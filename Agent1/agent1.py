from openai import OpenAI
import os
import http.client
import json
import sys
from pathlib import Path
parent_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(parent_dir))
from agent2.agent2_1 import run_pipeline
import glob

import http.client
import json

def gpt_api(messages: list):
    """调用第三方 GPT 接口并返回 assistant 的回答内容"""
    print("opening gpt api")

    conn = http.client.HTTPSConnection("mian.456478.xyz")
    payload = json.dumps({
        "model": "gpt-3.5-turbo",
        "messages": messages
    })
    headers = {
        'Accept': 'application/json',
        'Authorization': 'Bearer sk-FQwCEXIcPUQQewLrNSZW7Cm8Rmxgb4LlXetESBwijTCMaQBo',
        'Content-Type': 'application/json'
    }

    conn.request("POST", "/v1/chat/completions", payload, headers)
    res = conn.getresponse()
    print(res)
    data = res.read()

    try:
        response = json.loads(data.decode("utf-8"))
        content = response["choices"][0]["message"]["content"]
        print(content)
        return content
    except Exception as e:
        print("Error parsing response:", e)
        print("Raw response:", data.decode("utf-8"))
        return None


def resume_agent1(order,JP,JD,docu_RESUME):
    #with open(docu_JD, 'r', encoding='utf-8') as file:
    with open(docu_RESUME, 'r', encoding='utf-8') as file:
      resume = file.read()
    system_prompt=(
                    "As a professional resume editor,please modify the resume based on the following instructions:\n"
                    "<1. Keep all existing work experience and project experience entries; do not delete or add any entries.>\n"
                    "<2. Only modify the description field under each entry to better align with the provided Job Description (JD).>\n"
                   "<3. Emphasize skills, achievements, and responsibilities that are relevant to the JD, using professional and impactful language.>\n"
                   "<4. For entries that are not directly related to the JD, reframe them to highlight transferable skills such as leadership, communication, teamwork, problem-solving and so on.>\n"
                   "<5. Maintain a concise, professional tone throughout.>")
    output_format=(
                    "Output: Return strictly valid JSON without any explanation or extra text."
    )
    with open('Agent1/example/example1.json', 'r', encoding='utf-8') as file:
      example_1_json = file.read()
    with open('Agent1/example/example1_consulting.json', 'r', encoding='utf-8') as file:
      example_1_consult = file.read()
    with open('Agent1/example/example1_doctor.json', 'r', encoding='utf-8') as file:
      example_1_doctor = file.read()
    messages = [
    {
        'role': 'system',
    'content': f"""{system_prompt}\n\n{output_format}

      ### Example 1: Consulting Alignment
      Input (Original Resume in JSON):
      {example_1_json}

      Job Description:
      Position: Associate Consultant
      Description: We are looking for candidates who excel at structured problem-solving, data analysis, and cross-functional collaboration. The role involves conducting market research, synthesizing complex information into actionable insights, and supporting strategic recommendations for clients across industries. A strong interest in business strategy is preferred.

      Output (Revised Resume in JSON):
      {example_1_consult}

      ### Example 2: Doctor Alignment
      Input (Original Resume in JSON):
      {example_1_json}

      Job Description:
      Position: Doctor
      Description: We are seeking a dedicated and detail-oriented medical doctor to provide high-quality patient care in a clinical setting. Responsibilities include performing physical examinations, making diagnoses, ordering and interpreting tests, developing treatment plans, and communicating effectively with patients and interdisciplinary teams. The ideal candidate demonstrates strong clinical reasoning, evidence-based practice, and a commitment to continuous learning.

      Output (Revised Resume in JSON):
      {example_1_doctor}"""},
        {
            'role': 'user',
            'content': f"""
            Input (Original Resume in JSON):
            {resume}
            
            
            Job Description:
            Position: {JP}
            Description: {JD}
        
            Just modify the resume according to the job description but keep every existing experience entry even if it is not relevant."""
        }
    ]
    
    # Call API using the custom endpoint
    response = gpt_api(messages)

    # 保存结果
    # os.makedirs("output_resume", exist_ok=True)
    with open(f"Agent1/output_resume/{order}_revised_resume.json", "w", encoding="utf-8") as f:
        f.write(response)

# 读取 JSON 文件
with open('Agent1/job_description/jobs.json', 'r', encoding='utf-8') as f:
    jd_json = json.load(f)

# 提取 job_position 和 job_description
positions = jd_json["job_position"]
descriptions =jd_json["job_description"]

#遍历 job_position 和对应的 jd
for key in positions:
    position = positions[key]
    jd = descriptions.get(key, "No description available.")
    print(f"Job Position: {position}")
    resume_agent1(key,position,jd,docu_RESUME='frontend/output/resume-data.json')
    print("-" * 50)

resume_files = sorted(glob.glob("Agent1/output_resume/*_revised_resume.json"))

for resume_file in resume_files:
    md_paths = run_pipeline(
        jd_file="Agent1/job_description/jobs.json",
        resume_file=resume_file,
        out_dir="./final_resumes"
    )
    print(md_paths)


