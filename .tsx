"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, CircleCheck, Archive, FileText, Zap, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface VideoRecommendation {
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

interface AnalysisData {
  analysis: {
    ats_score: number;
    score_breakdown: {
      keyword_optimization: number;
      formatting: number;
      readability: number;
      relevance: number;
      completeness: number;
      customization: number;
    };
    summary: string;
    strengths: {
      content: string[];
      structure: string[];
    };
    improvement_areas: {
      critical: string[];
      recommended: string[];
    };
    keyword_analysis: {
      missing_keywords: string[];
      overused_terms: string[];
    };
    section_analysis: {
      contact_info: string;
      summary: string;
      experience: string;
      education: string;
      skills: string;
    };
    actionable_recommendations: {
      immediate_actions: string[];
      enhancements: string[];
    };
    ats_specific_advice: string[];
    VideoRecommendation: VideoRecommendation[];
  };
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

const ExpandableSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="mb-6 bg-gray-800 rounded-lg overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          {icon}
          <h3 className="text-xl font-semibold text-white ml-2">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
        </motion.div>
      </div>

      {isExpanded && (
        <motion.div
          className="p-4 bg-gray-900 border-t border-gray-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

const AnimatedListItem: React.FC<{ text: string; delay: number; icon: React.ReactNode }> = ({ text, delay, icon }) => {
  return (
    <motion.li
      className="flex items-start mb-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.1 }}
    >
      <span className="mr-2 mt-1 text-indigo-400">{icon}</span>
      <span className="text-gray-300">{text}</span>
    </motion.li>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default function ResumeAnalysisUI() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/manil.pdf');
      const pdfBlob = await response.blob();
      const resumeFile = new File([pdfBlob], 'manil.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const apiResponse = await axios.post('/api/gemini/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysis(apiResponse.data);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">No analysis data available</div>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 'calc(150vh - 700px)' }} className="scroll-container overflow-y-auto min-h-screen bg-gray-900 text-gray-100 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8 text-center">
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
          >
            Resume ATS Analysis
          </motion.h1>
        </header>

        {/* Score Overview */}
        <motion.div
          className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ATS Compatibility Score</h2>
            <motion.button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={18} className="mr-2" />
              Export Report
            </motion.button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <motion.div
              className="flex-1 flex items-center justify-center bg-gray-900 rounded-xl p-8 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <svg className="w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="70"
                    stroke="#374151"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="70"
                    stroke={analysis.analysis.ats_score >= 80 ? "#34D399" : analysis.analysis.ats_score >= 60 ? "#FBBF24" : "#F87171"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ strokeDasharray: 440, strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * analysis.analysis.ats_score / 100) }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-5xl font-bold ${getScoreColor(analysis.analysis.ats_score)}`}>
                    {analysis.analysis.ats_score}
                  </span>
                  <span className="text-gray-400 mt-1">out of 100</span>
                </div>
              </div>
            </motion.div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(analysis.analysis.score_breakdown).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-white font-medium">{value}/25</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getScoreColor(value * 4)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 25) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 * index }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-300">{analysis.analysis.summary}</p>
          </motion.div>
        </motion.div>

        {/* Main Analysis Sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Strengths */}
          <ExpandableSection
            title="Strengths"
            icon={<CheckCircle className="text-green-400" size={20} />}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-indigo-400 mb-2">Content</h4>
                <ul className="space-y-2">
                  {analysis.analysis.strengths.content.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<CheckCircle size={16} />}
                    />
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-medium text-indigo-400 mb-2">Structure</h4>
                <ul className="space-y-2">
                  {analysis.analysis.strengths.structure.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<CheckCircle size={16} />}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </ExpandableSection>

          {/* Improvement Areas */}
          <ExpandableSection
            title="Areas for Improvement"
            icon={<AlertCircle className="text-red-400" size={20} />}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-red-400 mb-2">Critical</h4>
                <ul className="space-y-2">
                  {analysis.analysis.improvement_areas.critical.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<AlertCircle size={16} />}
                    />
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-yellow-400 mb-2">Recommended</h4>
                <ul className="space-y-2">
                  {analysis.analysis.improvement_areas.recommended.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<ChevronDown size={16} />}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </ExpandableSection>

          {/* Video Recommendations */}
          <ExpandableSection
            title="Recommended Videos"
            icon={<FileText className="text-blue-400" size={20} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.analysis.VideoRecommendation.map((video, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium text-white mb-1 line-clamp-2">{video.title}</h4>
                    <p className="text-gray-400 text-sm">{video.channel}</p>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 text-sm mt-2 inline-block hover:underline"
                    >
                      Watch Video →
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </ExpandableSection>

          {/* Rest of your sections... */}
          {/* Keyword Analysis */}
          <ExpandableSection
            title="Keyword Analysis"
            icon={<FileText className="text-blue-400" size={20} />}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-yellow-400 mb-2">Missing Keywords</h4>
                <ul className="space-y-2">
                  {analysis.keyword_analysis.missing_keywords.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<AlertCircle size={16} />}
                    />
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-blue-400 mb-2">Overused Terms</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyword_analysis.overused_terms.map((term, index) => (
                    <motion.span
                      key={index}
                      className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {term}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Section Analysis */}
          <ExpandableSection
            title="Section Analysis"
            icon={<BarChart3 className="text-purple-400" size={20} />}
          >
            <div className="space-y-4">
              {Object.entries(analysis.section_analysis).map(([section, feedback], index) => (
                <motion.div
                  key={section}
                  className="p-4 bg-gray-800 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="text-lg font-medium text-indigo-400 mb-2 capitalize">
                    {section.replace('_', ' ')}
                  </h4>
                  <p className="text-gray-300">{feedback}</p>
                </motion.div>
              ))}
            </div>
          </ExpandableSection>

          {/* Actionable Recommendations */}
          <ExpandableSection
            title="Actionable Recommendations"
            icon={<Zap className="text-yellow-400" size={20} />}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-green-400 mb-2">Immediate Actions</h4>
                <ul className="space-y-2">
                  {analysis.actionable_recommendations.immediate_actions.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<Zap size={16} />}
                    />
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-lg font-medium text-blue-400 mb-2">Enhancements</h4>
                <ul className="space-y-2">
                  {analysis.actionable_recommendations.enhancements.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<ChevronUp size={16} />}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </ExpandableSection>

          {/* ATS Specific Advice */}
          <ExpandableSection
            title="ATS Specific Advice"
            icon={<Archive className="text-indigo-400" size={20} />}
          >
            <ul className="space-y-3">
              {analysis.ats_specific_advice.map((advice, index) => (
                <AnimatedListItem
                  key={index}
                  text={advice}
                  delay={index}
                  icon={<CircleCheck size={16} />}
                />
              ))}
            </ul>
          </ExpandableSection>
        </div>
      </motion.div>
    </div>
  );
}