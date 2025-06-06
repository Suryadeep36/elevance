# -*- coding: utf-8 -*-
"""Weighted Skills.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1V8WmkYD_3aH33dh-ZPZ40O_YnybohUp4
"""

import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

import pandas as pd

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

user_input = """
Machine Learning, Data Science, Deep Learning, .
"""

model = SentenceTransformer('all-MiniLM-L6-v2')
role_texts = [role['title'] + " " + role['description'] + " " + " ".join(role['skills']) for role in roles]
role_embeddings = model.encode(role_texts)
user_embedding = model.encode([user_input])
similarities = cosine_similarity(user_embedding, role_embeddings)[0]
df_roles["match_score"] = similarities
df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
df_roles_sorted

df_rec_course=df_roles_sorted.head()

df_rec_course

