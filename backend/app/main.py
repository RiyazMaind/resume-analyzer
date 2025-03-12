from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from fastapi.encoders import jsonable_encoder
import pdfplumber
import spacy
import re
import uuid
import os
from fuzzywuzzy import process  # For better skill matching

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["resume_analyzer"]
collection = db["resumes"]

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load spaCy NLP Model
nlp = spacy.load("en_core_web_sm")

# Skill Database for Fuzzy Matching
SKILLS_DB = [
    "Python", "SQL", "Machine Learning", "Deep Learning", "Data Analysis",
    "TensorFlow", "PyTorch", "Java", "C++", "Cloud Computing", "AWS", "Power BI",
    "Excel", "NLP", "FastAPI", "React", "Docker", "Kubernetes"
]

# Improved PDF Text Extraction
def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = []
        for page in pdf.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text.append(extracted_text)
        return "\n".join(text)

# Improved Email Extraction
def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    return match.group() if match else None

# Improved Phone Number Extraction
def extract_phone(text):
    match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{4,6}", text)
    return match.group() if match else None

# Extract LinkedIn & GitHub Links
def extract_links(text):
    matches = re.findall(r"(https?:\/\/[^\s]+)", text)
    return [link for link in matches if "linkedin.com" in link or "github.com" in link]

# Improved Skill Extraction with Fuzzy Matching
def extract_skills(text):
    extracted_skills = set()
    words = text.split()
    for i in range(len(words)):
        match, score = process.extractOne(words[i], SKILLS_DB)
        if score > 85:
            extracted_skills.add(match)
    return list(extracted_skills)

# Better Named Entity Extraction
def extract_named_entities(text):
    doc = nlp(text)
    extracted_data = {"name": None, "education": [], "experience": []}

    for ent in doc.ents:
        if ent.label_ == "PERSON" and not extracted_data["name"]:
            extracted_data["name"] = ent.text
        elif ent.label_ == "ORG" and any(x in ent.text.lower() for x in ["university", "college", "institute"]):
            extracted_data["education"].append(ent.text)
        elif ent.label_ in ["WORK_OF_ART", "JOB_TITLE"]:
            extracted_data["experience"].append(ent.text)

    return extracted_data

# Improved Section Extraction (Education, Experience, Projects, Certifications)
def extract_sections(text):
    sections = {
        "summary": None,
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
    }

    patterns = {
        "summary": r"SUMMARY(.*?)(?:EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS)",
        "experience": r"EXPERIENCE(.*?)(?:EDUCATION|PROJECTS|CERTIFICATIONS)",
        "education": r"EDUCATION(.*?)(?:PROJECTS|CERTIFICATIONS)",
        "projects": r"PROJECTS(.*?)(?:CERTIFICATIONS)",
        "certifications": r"CERTIFICATIONS(.*)"
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if match:
            sections[key] = match.group(1).strip()

    return sections

# Extract structured resume data
def extract_resume_data(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    
    entities = extract_named_entities(text)
    sections = extract_sections(text)

    resume_data = {
        "name": entities["name"],
        "email": extract_email(text),
        "phone": extract_phone(text),
        "linkedin_github_links": extract_links(text),
        "skills": extract_skills(text),
        "education": entities["education"],
        "experience": entities["experience"],
        "projects": sections["projects"],
        "certifications": sections["certifications"],
        "summary": sections["summary"]
    }

    return resume_data

# Extract skills from job description
def extract_skills_from_job_description(job_description):
    extracted_skills = set()
    words = job_description.split()
    for i in range(len(words)):
        match, score = process.extractOne(words[i], SKILLS_DB)
        if score > 85:
            extracted_skills.add(match)
    return list(extracted_skills)

# Score resume against job description
def score_resume(resume_skills, job_skills):
    matched_skills = set(resume_skills) & set(job_skills)
    score = len(matched_skills) / len(job_skills) * 100
    return score

# Upload and process resume with job description
@app.post("/upload/")
async def upload_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    if not file or not job_description:
        raise HTTPException(status_code=422, detail="File and job description are required.")
    
    try:
        file_contents = await file.read()
        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save file locally
        with open(file_path, "wb") as f:
            f.write(file_contents)

        extracted_data = extract_resume_data(file_path)
        job_skills = extract_skills_from_job_description(job_description)
        resume_skills = extracted_data["skills"]
        score = score_resume(resume_skills, job_skills)

        resume_data = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "filepath": file_path,
            "score": score,
            **extracted_data
        }

        collection.insert_one(jsonable_encoder(resume_data))

        return {"message": "Resume uploaded successfully!", "data": resume_data, "score": score}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))