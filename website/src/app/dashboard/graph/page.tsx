// app/page.tsx or any route
'use client';

import React from 'react';
import { SkillMatchChart } from '@/components/SkillMatchChart';
import { motion } from 'framer-motion';

const recommendedRoles = [
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
];

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-950 text-white p-6 md:p-12"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-blue-400">Career Skill Match</h1>
          <p className="text-gray-400 mb-8">Discover how your skills align with in-demand roles</p>
        </motion.div>
        
        <SkillMatchChart recommendedRoles={recommendedRoles} />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gray-900 p-6 rounded-xl shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-300">How to Use This Chart</h2>
          <ul className="text-gray-300 space-y-2">
            <li>• Hover over each bar to see detailed match information</li>
            <li>• Click on a career path to explore required skills</li>
            <li>• Higher percentages indicate better alignment with your current skill profile</li>
            <li>• Use these insights to guide your learning path and career decisions</li>
          </ul>
        </motion.div>
      </div>
    </motion.main>
  );
}