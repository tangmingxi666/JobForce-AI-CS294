from openai import OpenAI
import os
import http.client
import json
import sys
from pathlib import Path
import shutil
from glob import glob
parent_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(parent_dir))
import json

import http.client
import json
import subprocess
import os
#把最后做好的简历变成pdf
def latex_to_pdf(tex_file_path, output_dir=None, output_pdf_path=None):
    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(tex_file_path))


    cls_file = "markdown2pdf/example/resume.cls"
    shutil.copy2(cls_file, output_dir)

    command = [
        "pdflatex",
        "-interaction=nonstopmode",
        f"-output-directory={output_dir}",
        tex_file_path
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True)
        
        pdf_name = os.path.splitext(os.path.basename(tex_file_path))[0] + ".pdf"
        pdf_src = os.path.join(output_dir, pdf_name)
        
        if os.path.exists(pdf_src):
            print("✅ PDF generated successfully.")
            # 只有当 output_pdf_path 与 pdf_src 不同时才复制
            if output_pdf_path is not None and os.path.abspath(pdf_src) != os.path.abspath(output_pdf_path):
                os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
                shutil.copy2(pdf_src, output_pdf_path)
                print(f"PDF copied to {output_pdf_path}")
            else:
                print(f"PDF saved at {pdf_src}")
        else:
            print("❌ PDF generation failed - no PDF file was created")
            print("LaTeX output:", result.stdout)
            print("LaTeX errors:", result.stderr)
            
    except Exception as e:
        print("❌ PDF generation failed with error:")
        print(e)
#调openai的api
def gpt_api(messages: list):
    print("opening gpt api")
    conn = http.client.HTTPSConnection("mian.456478.xyz")
    payload = json.dumps({
        "model": "gpt-4o",
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

# 把agent2处理后的markdown，agent1是处理完的json
#输入：agent1的json，agent2的markdown，可以不动，可以不动
def resume_output(json_RESUME, md_RESUME, example_json_path, tex_path):
    print(f"Attempting to read JSON file from: {json_RESUME}")
    if not os.path.exists(json_RESUME):
        print(f"Error: File does not exist at {json_RESUME}")
        return
    try:
        with open(json_RESUME, 'r') as file:
            content = file.read()
            print(f"File content length: {len(content)}")
            if len(content) == 0:
                print("Error: File is empty")
                return
            resume_json = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        print(f"File content: {content[:200]}...")  # 打印前200个字符
        raise
    with open(md_RESUME, 'r', encoding='utf-8') as file:
        resume_md = file.read()
    with open(example_json_path, 'r', encoding='utf-8') as file:
            example_json = json.load(file)
    with open(tex_path, 'r', encoding='utf-8') as f:
        example = f.read()
    # with open(example_selected, 'r', encoding='utf-8') as f:
    #     example_selected_json = f.read()
    # with open(example_md, 'r', encoding='utf-8') as f:
    #     example_selected_json = f.read()
    system_prompt1=("You are given a JSON resume object and a Markdown document."
                    "Please examine whether each entry in projectExperience and workExperience"
                    " from the JSON is mentioned in the Markdown file (based on project name or description)."
                    "If an entry is not mentioned in any way, remove it from the JSON."
                    "Return the pruned JSON with only the relevant entries kept. Do not alter any content or fields otherwise.\n"
                    "Input:\n"
                    "resume.json: the full JSON resume\n"
                    "document.md: a Markdown file that may or may not mention projects or experiences\n"
                    "Output:\n"
                    "Return the modified JSON with unrelated projectExperience and workExperience entries deleted."
                    "Do not wrap the output in any markdown code block (i.e., no triple backticks or json)")
    system_prompt2 =(
                      "Now you have a JSON file containing a user's resume. "
                      "Please generate a complete LaTeX resume file using the structure and "
                      "style of the LaTeX example below.\n"
                      "Requirements:\n"
                      "Use the resume.cls class as shown in the example;"
                     "Organize content into sections: basic info, skills, education, work experience, and projects and activities;\n"
                     "Use the LaTeX example as a format reference only—replace all content with that from the JSON input.\n"
                      "Add a backslash (\) before every percentage(eg. 28% to be 28\%) \n"
                     "Return only the final LaTeX .tex content, no explanations or commentary;\n"
                      "Do not wrap the output in any markdown code block (i.e., no triple backticks )"
    )
    # example_prompt1=(
    #     f""" ### Example 1:\n
    # Input (Original Resume in JSON):
    # resume.json:{example_json}\n
    # document.md:{example_md}\n
    #
    # Output (Seleceted JSON):
    # {example_selected_json}
    # """
    # )
    example_prompt2=(
        f""" ### Example 1: \n
      Input (Original Resume in JSON):
      revised_resume.json:
      {example_json}\n

      Output (Resume in latex):
      {example}
      """
    )

    messages = [
        {
            'role': 'system',
            'content': f"""{system_prompt1}\n"""},
        {
            'role': 'user',
            'content': f"""
            Input :
            resume.json:{resume_json}\n
            document.md:{resume_md}\n
            Return the modified JSON with unmentioned projectExperience and workExperience entries deleted."""
        }
    ]
    response=gpt_api(messages)

    os.makedirs("markdown2pdf/selected_resume", exist_ok=True)
    with open(f"markdown2pdf/selected_resume/selected_resume.json", "w", encoding="utf-8") as f:
        f.write(response)
    with open("markdown2pdf/selected_resume/selected_resume.json", 'r', encoding='utf-8') as f:
        selected_resume = f.read()
    messages=[
    {
        'role': 'system',
        'content': f"""{system_prompt2}\n{example_prompt2}"""
    },
    {
        'role': 'user',
        'content': f"""
     Input :
     resume_revised.json:{selected_resume}\n"""
    }]
    response = gpt_api(messages)

    os.makedirs("agent3_output", exist_ok=True)
    with open(f"agent3_output/agent3_output_resume.tex", "w", encoding="utf-8") as f:
        f.write(response)


final_resumes_dir = "final_resumes"
date_folders = [d for d in os.listdir(final_resumes_dir) if os.path.isdir(os.path.join(final_resumes_dir, d))]
latest_date = sorted(date_folders)[-1]
latest_md_dir = os.path.join(final_resumes_dir, latest_date)

json_files = sorted(glob("Agent1/output_resume/*_revised_resume.json"))
md_files = sorted(glob(os.path.join(latest_md_dir, "resume_job*.md")))

import os
import shutil


for i, (input_json, input_md) in enumerate(zip(json_files, md_files), 1):
    tex_path = f"agent3_output/agent3_output_resume_{i}.tex"
    pdf_path = f"agent3_output/agent3_output_resume_{i}.pdf"

    frontend_pdf_path = f"frontend/public/customer_resumes/agent3_output_resume_{i}.pdf"

    resume_output(
        input_json,
        input_md,
        "markdown2pdf/example/example1_consulting.json",
        "markdown2pdf/example/example.tex"
    )

    original_tex_path = "agent3_output/agent3_output_resume.tex"
    shutil.copy2(original_tex_path, tex_path)
    latex_to_pdf(tex_path, output_pdf_path=pdf_path)
    

    os.makedirs("frontend/public/customer_resumes", exist_ok=True)
    shutil.copy2(pdf_path, frontend_pdf_path)
    print(f"✅ PDF copied to {frontend_pdf_path}")

import glob
import os

for ext in ["aux", "log", "out","tex","cls"]:
    for file in glob.glob(f"agent3_output/*.{ext}"):
        try:
            os.remove(file)
            print(f"Deleted: {file}")
        except Exception as e:
            print(f"Failed to delete {file}: {e}")

