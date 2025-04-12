"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, Archive, FileText, Zap, BarChart3, Briefcase, User, Calendar, Clock, Award, MessageSquare } from 'lucide-react';
import axios from 'axios';

// Types
interface VideoRecommendation {
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

interface ScoreBreakdown {
  keyword_optimization: number;
  formatting: number;
  readability: number;
  relevance: number;
  completeness: number;
  customization: number;
}

interface SectionAnalysis {
  contact_info: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

interface KeywordAnalysis {
  missing_keywords: string[];
  overused_terms: string[];
}

interface ActionableRecommendations {
  immediate_actions: string[];
  enhancements: string[];
}

interface Strengths {
  content: string[];
  structure: string[];
}

interface ImprovementAreas {
  critical: string[];
  recommended: string[];
}

interface Analysis {
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  summary: string;
  strengths: Strengths;
  improvement_areas: ImprovementAreas;
  keyword_analysis: KeywordAnalysis;
  section_analysis: SectionAnalysis;
  actionable_recommendations: ActionableRecommendations;
  ats_specific_advice: string[];
  VideoRecommendation: VideoRecommendation[];
}

interface AnalysisData {
  analysis: Analysis;
}

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tips: string[];
}

interface InterviewTips {
  generalTips: string[];
  behavioralQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
  questionsToAsk: string[];
  selfPresentation: {
    appearance: string[];
    communication: string[];
    body_language: string[];
  };
  preparationChecklist: string[];
}

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick, icon }) => (
  <button
    className={`flex items-center px-4 py-3 rounded-t-lg ${active ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400' : 'bg-gray-900 text-gray-400 hover:text-gray-200'
      }`}
    onClick={onClick}
  >
    <span className="mr-2">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ title, children, icon }) => {
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

interface AnimatedListItemProps {
  text: string;
  delay: number;
  icon: React.ReactNode;
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ text, delay, icon }) => {
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

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy': return 'text-green-400';
    case 'Medium': return 'text-yellow-400';
    case 'Hard': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

export default function ResumeInterviewAssistant() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [interviewTips, setInterviewTips] = useState<InterviewTips | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'interview'>('resume');
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);

  const fetchResumeAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch('/Kacha Parth.pdf');
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
      setInterviewTips(apiResponse.data.interviewTips);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeAnalysis();
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

  if (!analysis || !interviewTips) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-xl">No analysis data available</div>
      </div>
    );
  }

  return (
    <div
    style={{ maxHeight: 'calc(100vh - 100px)' }} 
    className="scroll-container overflow-y-auto min-h-screen bg-gray-900 text-gray-100 p-6"
   
    >
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
            Career Success Assistant
          </motion.h1>
          <p className="text-gray-400">Resume Analysis & Interview Preparation</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-800">
          <Tab
            label="Resume Analysis"
            active={activeTab === 'resume'}
            onClick={() => setActiveTab('resume')}
            icon={<FileText size={18} />}
          />
          <Tab
            label="Interview Preparation"
            active={activeTab === 'interview'}
            onClick={() => setActiveTab('interview')}
            icon={<Briefcase size={18} />}
          />
        </div>

        {/* Resume Analysis Tab */}
        {activeTab === 'resume' && analysis && (
          <>
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

              {analysis.analysis.VideoRecommendation && analysis.analysis.VideoRecommendation.length > 0 && (
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
              )}

              <ExpandableSection
                title="Actionable Recommendations"
                icon={<Zap className="text-yellow-400" size={20} />}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-medium text-green-400 mb-2">Immediate Actions</h4>
                    <ul className="space-y-2">
                      {analysis.analysis.actionable_recommendations.immediate_actions.map((item, index) => (
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
                      {analysis.analysis.actionable_recommendations.enhancements.map((item, index) => (
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
            </div>
          </>
        )}

        {/* Interview Preparation Tab */}
        {activeTab === 'interview' && interviewTips && (
          <>
            <motion.div
              className="bg-gray-800 rounded-xl p-6 mb-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <User className="mr-2 text-indigo-400" />
                Interview Preparation
              </h2>
              <p className="text-gray-300 mb-4">
                Based on your resume analysis, we've prepared personalized interview tips to help you showcase your skills effectively.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <motion.div
                  className="bg-gray-900 p-4 rounded-lg"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="text-blue-400 mb-2" />
                  <h3 className="font-semibold text-lg mb-1">Preparation Timeline</h3>
                  <p className="text-gray-400 text-sm">Start preparing at least 3-5 days before your interview</p>
                </motion.div>

                <motion.div
                  className="bg-gray-900 p-4 rounded-lg"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Clock className="text-green-400 mb-2" />
                  <h3 className="font-semibold text-lg mb-1">Interview Duration</h3>
                  <p className="text-gray-400 text-sm">Prepare for 45-60 minutes of questions and discussion</p>
                </motion.div>

                <motion.div
                  className="bg-gray-900 p-4 rounded-lg"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award className="text-yellow-400 mb-2" />
                  <h3 className="font-semibold text-lg mb-1">Success Rate</h3>
                  <p className="text-gray-400 text-sm">Proper preparation increases success by 50-70%</p>
                </motion.div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              <ExpandableSection
                title="General Tips"
                icon={<CheckCircle className="text-green-400" size={20} />}
              >
                <ul className="space-y-2">
                  {interviewTips.generalTips.map((tip, index) => (
                    <AnimatedListItem
                      key={index}
                      text={tip}
                      delay={index}
                      icon={<CheckCircle size={16} />}
                    />
                  ))}
                </ul>
              </ExpandableSection>

              <ExpandableSection
                title="Behavioral Questions"
                icon={<MessageSquare className="text-blue-400" size={20} />}
              >
                <div className="grid grid-cols-1 gap-4">
                  {interviewTips.behavioralQuestions.map((question, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-lg cursor-pointer ${selectedQuestion?.question === question.question ? 'bg-indigo-900' : 'bg-gray-800 hover:bg-gray-700'}`}
                      onClick={() => setSelectedQuestion(question)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{question.question}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{question.category}</p>
                    </motion.div>
                  ))}
                </div>
              </ExpandableSection>

              {selectedQuestion && (
                <ExpandableSection
                  title="Tips for Selected Question"
                  icon={<AlertCircle className="text-yellow-400" size={20} />}
                >
                  <ul className="space-y-2">
                    {selectedQuestion.tips.map((tip, index) => (
                      <AnimatedListItem
                        key={index}
                        text={tip}
                        delay={index}
                        icon={<CheckCircle size={16} />}
                      />
                    ))}
                  </ul>
                </ExpandableSection>
              )}

              <ExpandableSection
                title="Questions to Ask"
                icon={<MessageSquare className="text-purple-400" size={20} />}
              >
                <ul className="space-y-2">
                  {interviewTips.questionsToAsk.map((question, index) => (
                    <AnimatedListItem
                      key={index}
                      text={question}
                      delay={index}
                      icon={<ChevronUp size={16} />}
                    />
                  ))}
                </ul>
              </ExpandableSection>

              <ExpandableSection
                title="Preparation Checklist"
                icon={<CheckCircle className="text-green-400" size={20} />}
              >
                <ul className="space-y-2">
                  {interviewTips.preparationChecklist.map((item, index) => (
                    <AnimatedListItem
                      key={index}
                      text={item}
                      delay={index}
                      icon={<CheckCircle size={16} />}
                    />
                  ))}
                </ul>
              </ExpandableSection>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}