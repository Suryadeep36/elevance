from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import pdfplumber
import re
from sentence_transformers import SentenceTransformer, util
import io
from typing import List, Dict, Optional
import pandas as pd
import os
import faiss
import groq
import numpy as np
from pydantic import BaseModel
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import plotly.express as px
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import cv2

app = FastAPI()

# CORS configuration
origins = ['*']
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR for certificate verification
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Load course data for certificate verification
course_df = pd.read_csv("coursera_skill_clusters.csv")

# Load model once for skill extraction
model = SentenceTransformer('all-MiniLM-L6-v2')

known_skills = list(set([
    "python", "numpy", "pandas", "matplotlib", "seaborn", "plotly", "cufflinks", "geoplotting",
    "machine learning", "deep learning", "cnn", "ann", "supervised learning", "unsupervised learning",
    "php", "django", "html", "css", "sql", "javascript", "c", "c++",
    "data structures", "algorithms", "xgboost", "k-means", "transformers", "llms",
    "hugging face", "t5", "wav2vec2", "google colab", "flask", "streamlit", "react",
    "pytorch", "tensorflow", "linux", "git", "docker", "mysql", "postgresql"
]))
skill_embeddings = model.encode(known_skills, convert_to_tensor=True)

career_mapping = {
    0: "Machine Learning Engineer",
    1: "Frontend Web Developer",
    2: "Backend Web Developer",
    3: "App Developer",
    4: "Cloud Engineer",
    5: "Generalist / Software Engineer"
}

TEXT_FILE = "text_chunks.txt"
TOP_K = 5
GROQ_API_KEY = "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"

# Setup Groq client
os.environ["GROQ_API_KEY"] = GROQ_API_KEY
client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))

# Load model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Load text chunks
def load_text_chunks(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} not found.")
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read().splitlines()

text_chunks = load_text_chunks(TEXT_FILE)
index = faiss.IndexFlatL2(model.get_sentence_embedding_dimension())
embeddings = model.encode(text_chunks, convert_to_numpy=True).astype(np.float32)
index.add(embeddings)

# FAISS Search
def search_chunks(query, chunks, index, top_k=TOP_K):
    query_embedding = model.encode([query]).astype(np.float32)
    distances, indices = index.search(query_embedding, top_k)
    return [chunks[i] for i in indices[0] if 0 <= i < len(chunks)]

# Groq Query
def query_groq(query, context_chunks):
    context = "\n".join(context_chunks)
    prompt = f"""
You are a personal AI career advisor. Only respond to queries related to the technologies in the software engineering that are  "python", "numpy", "pandas", "matplotlib", "seaborn", "plotly", "cufflinks", "geoplotting",
    "machine learning", "deep learning", "cnn", "ann", "supervised learning", "unsupervised learning",
    "php", "django", "html", "css", "sql", "javascript", "c", "c++",
    "data structures", "algorithms", "xgboost", "k-means", "transformers", "llms",
    "hugging face", "t5", "wav2vec2", "google colab", "flask", "streamlit", "react",
    "pytorch", "tensorflow", "linux", "git", "docker", "mysql", "postgresql" and all the other frameworks, technologies in the software.

Use the following retrieved context to assist the user:

{context}

Question: {query}
Answer:
"""
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a helpful AI."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300
    )
    return response.choices[0].message.content.strip()

def clean_resume_text(text):
    text = re.sub(r'[•|]', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower()

def extract_skills_from_resume(resume_text, similarity_threshold=0.4):
    resume_text = clean_resume_text(resume_text)
    phrases = re.split(r'[\n,.;:]', resume_text)
    phrases = [phrase.strip() for phrase in phrases if len(phrase.strip()) >= 2]
    phrase_embeddings = model.encode(phrases, convert_to_tensor=True)

    extracted_skills = set()
    for i, phrase in enumerate(phrases):
        sim = util.cos_sim(phrase_embeddings[i], skill_embeddings)
        top_idx = sim.argmax().item()
        top_score = sim[0][top_idx].item()
        if top_score >= similarity_threshold:
            extracted_skills.add(known_skills[top_idx])

    return sorted(extracted_skills)

def extract_text_from_pdf(file_bytes):
    full_text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text.strip()

def extract_text_from_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    results = ocr.ocr(image_cv, cls=True)
    text = "\n".join([line[1][0] for line in results[0]])
    return text

class VerificationResult(BaseModel):
    courses_found: List[Dict[str, str]]
    platform_verified: bool
    user_name_verified: bool
    valid_certificate: bool
    extracted_text: Optional[str] = None

class QueryRequest(BaseModel):
    query: str

@app.post("/verify-certificate", response_model=VerificationResult)
async def verify_certificate(
    name: str = Form(...),
    certificate: UploadFile = File(...)
):
    # Check file type
    if certificate.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or PDF files are supported.")

    # Read and process file
    contents = await certificate.read()
    
    if certificate.content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    else:
        text = extract_text_from_image(contents)
    

  

    # Match courses
    matched_courses = []
    for idx, row in course_df.iterrows():
        course_name = row["course"]
        if pd.notna(course_name) and course_name.lower() in text.lower():
            matched_courses.append({
                "course_name": course_name,
                "cluster": row.get("cluster", "Unknown")
            })

    # Check platform
    platform_found = any(
        p in text 
        for p in ["coursera", "udemy", "edx", "skillshare"]
    )
    
    # Check user name
    user_verified = name in text

    return {
        "courses_found": matched_courses,
        "platform_verified": platform_found,
        "user_name_verified": user_verified,
        "valid_certificate": bool(matched_courses and platform_found),
        "extracted_text": text
    }

@app.post("/extract-skills")
async def extract_skills(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        return JSONResponse(status_code=400, content={"error": "Only PDF files are supported."})

    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)
    skills = extract_skills_from_resume(resume_text)
    return {"extracted_skills": skills}

@app.post("/suggest-career")
async def suggest_career(files: List[UploadFile] = File(...)):
    all_skills_per_resume = []
    file_names = []

    for file in files:
        if file.content_type != "application/pdf":
            return JSONResponse(status_code=400, content={"error": f"{file.filename} is not a PDF."})

        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        skills = extract_skills_from_resume(resume_text)
        all_skills_per_resume.append(skills)
        file_names.append(file.filename)

    all_skills = list(set([skill.lower() for resume in all_skills_per_resume for skill in resume]))

    def build_skill_matrix(resumes, all_skills):
        matrix = []
        for skills in resumes:
            row = [1 if skill in skills else 0 for skill in all_skills]
            matrix.append(row)
        return pd.DataFrame(matrix, columns=all_skills)

    skill_df = build_skill_matrix(all_skills_per_resume, all_skills)

    k = min(6, len(files))
    kmeans = KMeans(n_clusters=k, random_state=42)
    skill_df["cluster"] = kmeans.fit_predict(skill_df)

    cluster_to_top_skills = {}
    for cluster_num in range(k):
        cluster_skills = skill_df[skill_df["cluster"] == cluster_num].drop(columns=["cluster"]).sum()
        top_skills = cluster_skills.sort_values(ascending=False).head(5).index.tolist()
        cluster_to_top_skills[cluster_num] = top_skills

    cluster_to_career = {}
    for cluster_num, skills in cluster_to_top_skills.items():
        if "machine learning" in skills or "pytorch" in skills or "tensorflow" in skills:
            cluster_to_career[cluster_num] = "Machine Learning"
        elif "html" in skills or "css" in skills or "javascript" in skills:
            cluster_to_career[cluster_num] = "Frontend Developer"
        elif "django" in skills or "flask" in skills or "sql" in skills:
            cluster_to_career[cluster_num] = "Backend Developer"
        elif "flutter" in skills or "android" in skills:
            cluster_to_career[cluster_num] = "App Developer"
        elif "docker" in skills or "linux" in skills or "aws" in skills:
            cluster_to_career[cluster_num] = "Cloud Engineer"
        else:
            cluster_to_career[cluster_num] = "Generalist / Software Engineer"

    results = []
    for idx, skills in enumerate(all_skills_per_resume):
        cluster = skill_df.iloc[idx]["cluster"]
        results.append({
            "file": file_names[idx],
            "skills": skills,
            "cluster": int(cluster),
            "career_suggestion": cluster_to_career[int(cluster)]
        })

    return {"results": results}

@app.post("/recommend-jobs")
async def recommend_jobs(skills: List[str]):
    df = pd.read_csv("ai_job_market_insights.csv")

    try:
        if df.empty:
            return JSONResponse(
                status_code=404,
                content={"error": "Job dataset not found. Please ensure ai_job_market_insights.csv exists."}
            )

        # Vectorize job required skills
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(df['Required_Skills'].fillna(""))

        # Prepare user input
        user_input = ', '.join(skills)
        user_vec = vectorizer.transform([user_input])

        # Compute cosine similarity
        similarities = cosine_similarity(user_vec, X).flatten()
        top_indices = similarities.argsort()[-5:][::-1]
        recommended_jobs = df.iloc[top_indices]

        return {
            "recommended_jobs": recommended_jobs.to_dict(orient="records")
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/job-analysis")
async def jobs_analysis():
    df = pd.read_csv("ai_job_market_insights.csv")
    """Endpoint to return processed data for frontend"""
    df=pd.read_csv("ai_job_market_insights.csv")
    salary_by_title = df.groupby("Job_Title", as_index=False)["Salary_USD"].mean().sort_values(by="Salary_USD", ascending=False).to_dict('records')
    industry_distribution = df["Industry"].value_counts().reset_index().rename(columns={"count": "value"}).to_dict('records')
    
    return {
        "salary_by_title": salary_by_title,
        "industry_distribution": industry_distribution,
        "raw_data": df.to_dict('records')
    }

@app.post("/query")
def handle_query(request: QueryRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    retrieved = search_chunks(query, text_chunks, index)
    response = query_groq(query, retrieved)
    return {"answer": response}

@app.get("/")
async def root():
    return {"message": "Career and Certificate Verification API"}
    
# --career recommandation

coursera_df = pd.read_csv("Coursera.csv")
roles = [
    {"title": "AI Engineer", "description": "Develops AI models and ML pipelines for automation and smart applications.",
     "skills": ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-learn"]},

    {"title": "Data Scientist", "description": "Performs advanced statistical analysis and builds predictive models.",
     "skills": ["Python", "R", "Statistics", "Machine Learning", "Pandas", "Matplotlib", "SQL"]},

    {"title": "Data Analyst", "description": "Analyzes data trends, creates reports, and builds dashboards.",
     "skills": ["SQL", "Excel", "Tableau", "Statistics", "Power BI", "Python"]},

    {"title": "Web Developer", "description": "Builds and maintains websites and web apps using front and back-end tech.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB"]},

    {"title": "Frontend Developer", "description": "Creates interactive user interfaces and optimizes user experiences.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Vue.js", "TypeScript", "Figma"]},

    {"title": "Backend Developer", "description": "Develops server-side logic and integrates with databases.",
     "skills": ["Node.js", "Express", "Django", "Flask", "SQL", "MongoDB", "Python", "Java"]},

    {"title": "DevOps Engineer", "description": "Manages CI/CD pipelines, infrastructure automation, and deployments.",
     "skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux", "Jenkins"]},

    {"title": "Cloud Engineer", "description": "Designs and maintains cloud infrastructure and services.",
     "skills": ["AWS", "Azure", "Google Cloud", "Terraform", "CloudFormation", "Python"]},

    {"title": "Cybersecurity Analyst", "description": "Protects systems from attacks and monitors suspicious activity.",
     "skills": ["Networking", "Linux", "Python", "Security Tools", "Penetration Testing", "Firewalls"]},

    {"title": "Mobile App Developer", "description": "Builds apps for Android and iOS platforms.",
     "skills": ["Kotlin", "Swift", "React Native", "Flutter", "Java", "Dart", "Firebase"]},

    {"title": "Game Developer", "description": "Creates video games for different platforms.",
     "skills": ["Unity", "C#", "Unreal Engine", "C++", "3D Modeling", "Game Design"]},

    {"title": "Blockchain Developer", "description": "Develops decentralized applications and smart contracts.",
     "skills": ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "Cryptography", "Rust"]},

    {"title": "Machine Learning Engineer", "description": "Designs ML systems and productionizes models.",
     "skills": ["Scikit-learn", "TensorFlow", "Keras", "ML Ops", "Python", "Pandas", "Airflow"]},

    {"title": "NLP Engineer", "description": "Focuses on text-based AI like chatbots, translation, sentiment analysis.",
     "skills": ["SpaCy", "NLTK", "Hugging Face Transformers", "BERT", "Text Classification", "Python"]},

    {"title": "Robotics Engineer", "description": "Builds robotic systems using software and hardware integration.",
     "skills": ["ROS", "C++", "Python", "Sensors", "Actuators", "Embedded Systems"]},

    {"title": "Embedded Systems Engineer", "description": "Develops software for embedded devices like microcontrollers.",
     "skills": ["C", "C++", "Assembly", "RTOS", "Microcontrollers", "I2C", "SPI"]},

    {"title": "Systems Administrator", "description": "Maintains server infrastructure and IT systems.",
     "skills": ["Linux", "Bash", "Networking", "Firewalls", "System Monitoring", "VMware"]},

    {"title": "Database Administrator", "description": "Maintains and optimizes databases for performance and reliability.",
     "skills": ["SQL", "Oracle", "MySQL", "PostgreSQL", "Backup & Recovery", "Database Tuning"]},

    {"title": "Full Stack Developer", "description": "Works on both frontend and backend parts of applications.",
     "skills": ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS", "Python", "Express.js"]},

    {"title": "UI/UX Designer", "description": "Designs intuitive user interfaces and experiences.",
     "skills": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Sketch"]}
]

df_roles = pd.DataFrame(roles)
model = SentenceTransformer('all-MiniLM-L6-v2')

coursera_df = pd.read_csv("Coursera.csv")

class UserProfile(BaseModel):
    name: str
    current_skills: List[str]
    desired_skills: List[str]
    level: str  # Beginner | Intermediate | Advanced | Expert
    experience_years: float
    education: str
 

class RecommendedCourse(BaseModel):
    course: str
    skills: str
    rating: float
    reviewcount: str
    duration: str
    similarity: float

class CareerRecommendation(BaseModel):
    career_role: str
    match_score: float
    recommended_courses: List[RecommendedCourse]

class RecommendationResponse(BaseModel):
    recommended_careers: List[CareerRecommendation]

@app.post("/recommend-career-path", response_model=RecommendationResponse)
def recommend_career_path(desired_skils : List[str]):
        # Step 1: Recommend career roles based on desired skills
        user_input = desired_skils
        role_texts = [role['title'] + " " + role['description'] + " " + " ".join(role['skills']) for role in roles]
        role_embeddings = model.encode(role_texts)
        user_embedding = model.encode([user_input])
        similarities = cosine_similarity(user_embedding, role_embeddings)[0]
        
        df_roles["match_score"] = similarities
        df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
        df_rec_course = df_roles_sorted.head(5)  # Get top 5 roles
        
        # Step 2: Get course recommendations for each role
        recommendations = []
        for _, role in df_rec_course.iterrows():
            role_skills = [s.strip() for s in role["skills"]]
            role_skill_embeddings = model.encode(role_skills)
            
            recommended_courses = []
            for _, course in coursera_df.iterrows():
                course_skills = str(course["skills"]).split(",")
                course_skills_cleaned = [s.strip() for s in course_skills]
                
                if not course_skills_cleaned:
                    continue
                
                course_skill_embeddings = model.encode(course_skills_cleaned)
                sim_matrix = cosine_similarity(role_skill_embeddings, course_skill_embeddings)
                max_sim = sim_matrix.max()
                
                if max_sim >= 0.5:  # similarity threshold
                    try:
                        course_rating = float(course["rating"])
                    except:
                        course_rating = 0.0
                    
                    recommended_courses.append({
                        "course": course["course"],
                        "skills": course["skills"],
                        "rating": course_rating,
                        "reviewcount": course.get("reviewcount", "N/A"),
                        "duration": course.get("duration", "N/A"),
                        "similarity": round(float(max_sim), 3)
                    })
            
            # Sort and get top 5 courses
            sorted_courses = sorted(recommended_courses, 
                                  key=lambda x: (x["similarity"], x["rating"]), 
                                  reverse=True)[:5]
            
            recommendations.append({
                "career_role": role["title"],
                "match_score": float(role["match_score"]),
                "recommended_courses": sorted_courses
            })
        
        return {"recommended_careers": recommendations}

model = SentenceTransformer('all-MiniLM-L6-v2')    
class SkillInput(BaseModel):
    skills: str  # e.g. "Machine Learning, Deep Learning, Data Science"

@app.post("/recommend-roles")
def recommend_roles(user_input: SkillInput):
    df_roles = pd.DataFrame(roles)

    # Create embeddings
    role_texts = [
        f"{role['title']} {role['description']} {' '.join(role['skills'])}" for role in roles
    ]
    role_embeddings = model.encode(role_texts)
    user_embedding = model.encode([user_input.skills])

    # Compute similarity
    similarities = cosine_similarity(user_embedding, role_embeddings)[0]
    df_roles["match_score"] = similarities
    df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
    top_roles = df_roles_sorted.head(5).to_dict(orient="records")

    return {"recommended_roles": top_roles}
