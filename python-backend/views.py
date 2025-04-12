import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import groq

# --- Configuration ---
TEXT_FILE = "text_chunks.txt"  # Make sure this file exists with relevant content
TOP_K = 5
GROQ_API_KEY = "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"

# --- Setup Groq client ---
os.environ["GROQ_API_KEY"] = GROQ_API_KEY
client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))

# --- Load Sentence Transformer model ---
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# --- Load text chunks from .txt file ---
def load_text_chunks(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Error: {filepath} not found.")
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read().splitlines()

# --- Create FAISS index ---
def create_index(chunks):
    embeddings = model.encode(chunks, convert_to_numpy=True).astype(np.float32)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index

# --- Search FAISS ---
def search_chunks(query, chunks, index, top_k=TOP_K):
    query_embedding = model.encode([query]).astype(np.float32)
    distances, indices = index.search(query_embedding, top_k)
    return [chunks[i] for i in indices[0] if 0 <= i < len(chunks)]

# --- Query Groq ---
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

# --- Main Chat Loop ---
if __name__ == "__main__":
    print("📄 Loading text chunks...")
    text_chunks = load_text_chunks(TEXT_FILE)

    if not text_chunks:
        exit("No text chunks loaded. Exiting.")

    print("🧠 Building FAISS index...")
    index = create_index(text_chunks)

    print("🤖 Career Chatbot Ready! Type your question below.")
    while True:
        query = input("\nYou: ").strip()
        if query.lower() in ("exit", "quit"):
            print("👋 Goodbye!")
            break

        retrieved = search_chunks(query, text_chunks, index)
        answer = query_groq(query, retrieved)
        print(f"\nBot: {answer}")
