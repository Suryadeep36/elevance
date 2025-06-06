# -*- coding: utf-8 -*-
"""Untitled3.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1I42ASrfQKUbK-G52_gVsyJ-OFd5HZYIN
"""

pip install sentence-transformers

pip install transformers

pip install pdfplumber

import pdfplumber

def extract_text_from_pdf(file_path):
    full_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            full_text += page.extract_text() + "\n"
    return full_text.strip()

import re
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

# Master skill list (extend as needed)
known_skills = list(set([
    "python", "EDA", "sklearn", "tensorflow", "keras", "cnn", "deep learning", "ml", "supervised learning", "unsupervised learning",
    "html", "css", "javascript", "php", "django", "flask", "react", "node.js", "mysql", "sql", "frontend", "backend", "web dev",
    "android", "kotlin", "flutter", "dart", "ios", "swift", "react native", "mobile dev",
    "c", "c++", "git", "github", "data structures", "algorithms", "problem solving", "communication", "teamwork",
    "Linux", "Computer Networking", "Docker", "Kubernetes", "AWS", "GCP", "azure", "EC2"
]))

skill_embeddings = model.encode(known_skills, convert_to_tensor=True)

def clean_resume_text(text):
    # Replace bullets and pipes with newlines for splitting
    text = re.sub(r'[•|]', '\n', text)
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.lower()

def extract_skills_from_resume(resume_text, similarity_threshold=0):
    resume_text = clean_resume_text(resume_text)

    # Split text into phrases
    phrases = re.split(r'[\n,.;:]', resume_text)
    phrases = [phrase.strip() for phrase in phrases if len(phrase.strip()) >= 2]

    # Embed phrases
    phrase_embeddings = model.encode(phrases, convert_to_tensor=True)

    extracted_skills = set()
    for i, phrase in enumerate(phrases):
        sim = util.cos_sim(phrase_embeddings[i], skill_embeddings)
        top_idx = sim.argmax().item()
        top_score = sim[0][top_idx].item()
        if top_score >= similarity_threshold:
            extracted_skills.add(known_skills[top_idx])

    return sorted(extracted_skills)

from google.colab import files
uploaded = files.upload()

from google.colab import files
uploaded = files.upload()

import pdfplumber

def extract_text_from_pdf(file_path):
    full_text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text.strip()

skill_domains = {
    "Machine Learning": ["python", "EDA", "sklearn", "tensorflow", "keras", "cnn", "deep learning", "ml", "supervised learning", "unsupervised learning"],
    "Front Web Development": ["html", "css","tailwind", "typescript","vue.js","redux", "javascript","vite", "react"],
    "Backend Web Development": ["next.js", "php", "django", "flask","node.js", "mysql", "sql", "express.js", "npm", "mongodb", "postman", "fast api"],
    "Cloud Computing": ["Linux", "Computer Networking", "Docker", "Kubernetes", "AWS", "GCP", "azure", "EC2"],
    "App Development": ["android studio", "kotlin", "flutter", "dart", "ios", "swift", "react native"],
    "General": ["c", "c++", "git", "github", "data structures", "algorithms", "problem solving", "communication", "teamwork"]
}

resume_text1 = extract_text_from_pdf("Kacha Parth.pdf")
resume_text2 = extract_text_from_pdf("Lade Taksh.pdf")
resume_text3 = extract_text_from_pdf("Nishant Resume.pdf")
resume_text4 = extract_text_from_pdf("Om Ashish Soni Resume.pdf")
resume_text5 = extract_text_from_pdf("Resume.pdf")
resume_text6 = extract_text_from_pdf("cloud resume.pdf")

skill1 = extract_skills_from_resume(resume_text1)
skill2 = extract_skills_from_resume(resume_text2)
skill3 = extract_skills_from_resume(resume_text3)
skill4 = extract_skills_from_resume(resume_text4)
skill5 = extract_skills_from_resume(resume_text5)
skill6 = extract_skills_from_resume(resume_text6)

skill6

resumes = [skill1, skill2, skill3, skill4, skill5, skill6]

from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd

# Flatten master skill list
all_skills = list(set([s.lower() for domain in skill_domains.values() for s in domain]))

# Turn resumes into binary matrix
def build_skill_matrix(resumes, all_skills):
    matrix = []
    for skills in resumes:
        row = [1 if skill in skills else 0 for skill in all_skills]
        matrix.append(row)
    return pd.DataFrame(matrix, columns=all_skills)

skill_df = build_skill_matrix(resumes, all_skills)



from sklearn.cluster import KMeans

k = 6  # number of desired career clusters
kmeans = KMeans(n_clusters=k, random_state=42)
skill_df["cluster"] = kmeans.fit_predict(skill_df)

for cluster_num in range(k):
    cluster_skills = skill_df[skill_df["cluster"] == cluster_num].drop(columns=["cluster"]).sum()
    top_skills = cluster_skills.sort_values(ascending=False).head(5).index.tolist()
    print(f"Cluster {cluster_num}: Likely Career Path → based on top skills: {top_skills}")

career_mapping = {
    0: "Machine Learning Engineer",
    1: "Frontend Web Developer",
    2: "Backend Web Developer",
    3: "App Developer",
    4: "Cloud Compting",
    5: "General"
}

skill_df["career_suggestion"] = skill_df["cluster"].map(career_mapping)
print(skill_df[["cluster", "career_suggestion"]])

skill_df

