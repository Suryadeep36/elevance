// app/page.tsx or any route
import { SkillMatchChart } from '@/components/SkillMatchChart';


const recommendedRoles: any[] = [
    {
        "title": "AI Engineer",
        "skills": ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-learn"],
        "match_score": 0.5045334100723267
    },
    {
        "title": "Machine Learning Engineer",
        "skills": ["Scikit-learn", "TensorFlow", "Keras", "ML Ops", "Python", "Pandas", "Airflow"],
        "match_score": 0.4709881544113159
    },
    {
        "title": "Data Scientist",
        "skills": ["Python", "R", "Statistics", "Machine Learning", "Pandas", "Matplotlib", "SQL"],
        "match_score": 0.4633447229862213
    },
    {
        "title": "Data Analyst",
        "skills": ["SQL", "Excel", "Tableau", "Statistics", "Power BI", "Python"],
        "match_score": 0.2978830337524414
    },
    {
        "title": "NLP Engineer",
        "skills": ["SpaCy", "NLTK", "Hugging Face Transformers", "BERT", "Text Classification", "Python"],
        "match_score": 0.26929813623428345
    }
]

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Skill Match Charts</h1>
      <SkillMatchChart roles={recommendedRoles} />
    </main>
  );
}
