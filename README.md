# JobForce

**JobForce** is an AI-powered resume optimization and job matching platform. Users can upload their resume, select target job positions, and the system will automatically generate tailored, position-specific resumes and downloadable PDFs using a multi-stage AI pipeline.

---

## Folder Descriptions

- **Agent1/**  
  Handles AI-powered resume rewriting and job description matching. Outputs a tailored JSON resume for each selected job position.
- **agent2/**  
  Integrates, scores, and selects the most relevant resume experiences for each job description, generating a concise Markdown resume tailored to each target position.
- **markdown2pdf/**  
  Converts Markdown/JSON resumes to LaTeX and then to PDF using pdflatex.
- **agent3_output/**  
  Stores intermediate LaTeX and PDF files generated during the pipeline.
- **final_resumes/**  
  Stores the final Markdown resumes.
- **frontend/**  
  Next.js web application for user input, job selection, preview, and PDF download.
- **requirements.txt**  
  Python backend dependency list.
- **package.json**  
  Frontend dependency list.

---

## Quick Start Demo
[![Watch the demo](https://img.youtube.com/vi/Odl5I4yek9w/0.jpg)](https://youtu.be/Odl5I4yek9w)


### 1. Install Dependencies

#### Python Backend
```bash
pip install -r requirements.txt
```

#### Node.js Frontend
```bash
cd frontend
npm install
```

### 2. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Run the Demo

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Fill in your resume information and select target job positions.
3. Click "Generate Resume" or "Finish" to trigger the backend pipeline.
4. On the preview page, download your AI-optimized, position-specific PDF resumes.

---

## Requirements

- **Python 3.8+**
- **Node.js 14+**
- **LaTeX distribution** (e.g., TinyTeX, TeX Live, with `pdflatex` support)
- **OpenAI API Key** (if using GPT-4/3.5, set via environment variable or config)

---

## Additional Notes

- The backend pipeline consists of three stages (Agent1/2/3), which can be run independently or as a full pipeline.
- All generated PDFs are saved in `frontend/public/customer_resumes/` for easy download via the frontend.
- To customize job descriptions or resume templates, edit `Agent1/job_description/jobs.json` or files in `markdown2pdf/example/`.

---

## Contributor
Mingxi Tang
Yijia You
Yufeng Yan
Kaiwen Dou
---

## Acknowledgements
We thank the Berkeley Advanced LLM Agents MOOC faculty for guidance and the open-source communities behind OpenAI, LangChain, FAISS, and Pinecone.



