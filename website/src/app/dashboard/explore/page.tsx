"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ElevanceLoader from '@/components/loader';
import { LightbulbIcon, BookOpen, Award, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

// Quiz types
type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type QuizReport = {
  skill: string;
  level: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  levelReached: string;
};

// Sample fallback questions in case API fails
const fallbackQuestions: Record<string, QuizQuestion[]> = {
  "default": [
    {
      question: "What is a key benefit of using a state management library like Redux?",
      options: [
        "It makes API calls faster", 
        "It provides a predictable state container", 
        "It reduces bundle size", 
        "It eliminates the need for components"
      ],
      answer: "It provides a predictable state container",
      explanation: "Redux provides a predictable state container that makes state changes explicit and helps manage complex application state."
    }
  ],
  "javascript": [
    {
      question: "What is the output of console.log(typeof null) in JavaScript?",
      options: ["null", "undefined", "object", "number"],
      answer: "object",
      explanation: "In JavaScript, typeof null returns 'object', which is considered a historical bug in the language."
    },
    {
      question: "Which method is used to add elements at the end of an array?",
      options: ["push()", "append()", "add()", "insert()"],
      answer: "push()",
      explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array."
    }
  ],
  "react": [
    {
      question: "What hook should be used for side effects in a React component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      answer: "useEffect",
      explanation: "useEffect is designed to handle side effects like API calls, subscriptions, and DOM manipulations."
    },
    {
      question: "What is JSX in React?",
      options: [
        "JavaScript XML - a syntax extension for JavaScript", 
        "A JavaScript library", 
        "Java Serialized XML", 
        "JavaScript XQuery"
      ],
      answer: "JavaScript XML - a syntax extension for JavaScript",
      explanation: "JSX is a syntax extension for JavaScript that looks similar to HTML and allows you to write HTML elements in JavaScript."
    }
  ]
};

export default function QuizPage() {
  // Core states
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [level, setLevel] = useState("beginner");
  const [skill, setSkill] = useState("");

  // Quiz flow states
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [quizData, setQuizData] = useState<QuizQuestion | null>(null);

  // Tracking states
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [report, setReport] = useState<QuizReport | null>(null);
  
  //loading 
  const [loading, setloading] = useState(false);

  //store all quizes
  const [quizes, setquizes] = useState<QuizQuestion[]>([]);

  // API error state
  const [apiError, setApiError] = useState<string | null>(null);

  // Level progression mapping
  const levels = ["beginner", "intermediate", "advanced", "expert"];

  // Provide a fallback question when API fails
  const useFallbackQuestion = () => {
    // Check if we have specific questions for this skill
    const lowerSkill = skill.toLowerCase();
    let questions;
    
    if (lowerSkill.includes('javascript')) {
      questions = fallbackQuestions.javascript;
    } else if (lowerSkill.includes('react')) {
      questions = fallbackQuestions.react;
    } else {
      questions = fallbackQuestions.default;
    }
    
    // Get a random question from the appropriate category
    const randomIndex = Math.floor(Math.random() * questions.length);
    const fallbackQuiz = questions[randomIndex];
    
    setquizes((prev) => [...prev, fallbackQuiz]);
    setQuizData(fallbackQuiz);
  };

  // Fetch a new quiz question with improved error handling
  async function fetchQuiz() {
    setloading(true);
    setApiError(null);
    
    // Set up a timeout to avoid waiting forever
    const timeoutId = setTimeout(() => {
      setloading(false);
      useFallbackQuestion();
      setApiError("Request timed out. Using a fallback question instead.");
    }, 10000); // 10 seconds timeout
    
    try {
      // Try to get quiz from the API
      const response = await axios.post("/api/gemini/quiz", {
        quizes,
        level,
        skill,
      }, {
        timeout: 15000 // Set axios timeout to be shorter than our own timeout
      });
      
      clearTimeout(timeoutId);
      
      if (response.data && response.data.quiz) {
        // console.log("Quiz data received:", response.data.quiz);
        setquizes((prev) => [...prev, response.data.quiz]);
        setQuizData(response.data.quiz);
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response from quiz API");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error fetching quiz:", error);
      
      // Log detailed error information
      if (axios.isAxiosError(error)) {
        console.error("API Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 404) {
          setApiError("Quiz API endpoint not found. Check if the server is running.");
        } else if (error.code === 'ECONNABORTED') {
          setApiError("Request timed out. The server took too long to respond.");
        } else {
          setApiError(`API error: ${error.message}`);
        }
      } else {
        setApiError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      useFallbackQuestion();
    } finally {
      setloading(false);
    }
  }

  // Start the quiz with selected skill
  const startQuiz = () => {
    if (!skill) return;
    setLevel("beginner");
    setQuizStarted(true);
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    fetchQuiz();
  };

  // Handle answer checking
  const handleCheck = () => {
    if (!selectedOption || !quizData) return;

    const correct = selectedOption === quizData.answer;
    setIsCorrect(correct);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      // Level up if got 2 consecutive correct answers at current level
      if (correctAnswers % 2 === 1 && levels.indexOf(level) < levels.length - 1) {
        const currentLevelIndex = levels.indexOf(level);
        setLevel(levels[currentLevelIndex + 1]);
      }
    } else {
      setWrongAnswers(prev => prev + 1);
    }

    setShowResult(true);
  };

  // Move to next question or finish quiz
  const handleNext = () => {
    if (questionNumber >= 10) {
      finishQuiz();
    } else {
      setQuestionNumber(prev => prev + 1);
      setSelectedOption("");
      setShowResult(false);
      fetchQuiz();
    }
  };

  // Generate final report
  const finishQuiz = () => {
    const totalQuestions = correctAnswers + wrongAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Determine achieved level based on accuracy
    let levelReached = "beginner";
    if (accuracy >= 90) levelReached = "expert";
    else if (accuracy >= 70) levelReached = "advanced";
    else if (accuracy >= 50) levelReached = "intermediate";

    setReport({
      skill,
      level,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      levelReached
    });

    setQuizFinished(true);
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setQuestionNumber(0);
    setSelectedOption("");
    setShowResult(false);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setReport(null);
    setSkill("");
  };

  return (
    <div className="min-h-full pb-20">
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Skill Assessment
          </h1>
          <div className="text-sm text-gray-400">
            Test your knowledge and measure your expertise in various technical skills
          </div>
        </motion.div>
      </header>

      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Quiz container with dynamic height */}
        <div className="relative mx-auto bg-gradient-to-br from-gray-800/50 to-gray-900/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-gray-700/50">
          {/* Glowing accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600"></div>
          
          {/* Quiz content */}
          <div className="p-8 relative z-10">
            {/* Skill Selection */}
            {!quizStarted && !quizFinished && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md mx-auto"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 260, 
                        damping: 20, 
                        delay: 0.2 
                      }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg"
                    >
                      <BookOpen className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-white">Start Your Skill Assessment</h2>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                      Enter a skill you want to test and we'll generate personalized questions to measure your expertise
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="skill-input"
                      className="block text-sm font-medium text-gray-300"
                    >
                      What skill do you want to test?
                    </label>
                    <div className="relative">
                      <input
                        id="skill-input"
                        type="text"
                        onChange={(evt) => setSkill(evt.target.value)}
                        value={skill}
                        placeholder="e.g. JavaScript, React, Python, Machine Learning"
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                      />
                      {skill && (
                        <button
                          type="button"
                          onClick={() => setSkill('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          aria-label="Clear input"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startQuiz}
                        disabled={!skill}
                        className={`w-full py-3 rounded-lg font-medium text-white text-base transition-all 
                          ${skill
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                        `}
                      >
                        <span className="flex items-center justify-center">
                          Start Assessment
                          {skill && (
                            <ArrowRight size={18} className="ml-2 inline-block" />
                          )}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Popular skills suggestions */}
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-3">Popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {['JavaScript', 'React', 'Python', 'UX Design', 'Data Science'].map((popularSkill, idx) => (
                        <motion.button
                          key={popularSkill}
                          onClick={() => setSkill(popularSkill)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (idx * 0.1) }}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md border border-gray-700"
                        >
                          {popularSkill}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz Questions */}
            {quizStarted && !quizFinished && quizData && (
              <>
                {/* Upper section with progress info */}
                <div className="mb-8">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center mr-3">
                          <LightbulbIcon size={20} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Current Level</div>
                          <div className="text-lg font-semibold">{level.charAt(0).toUpperCase() + level.slice(1)}</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-gray-400">Question</div>
                        <div className="text-2xl font-bold text-white">
                          {questionNumber}<span className="text-gray-500 text-lg">/10</span>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="text-center mr-4">
                          <div className="text-sm text-gray-400">Correct</div>
                          <div className="text-lg font-semibold text-green-400">{correctAnswers}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400">Wrong</div>
                          <div className="text-lg font-semibold text-red-400">{wrongAnswers}</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
                        initial={{ width: `${(questionNumber - 1) * 10}%` }}
                        animate={{ width: `${questionNumber * 10}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Skill being tested */}
                  <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-sm">
                    <span className="text-gray-400">Testing:</span> 
                    <span className="text-white font-medium ml-1">{skill}</span>
                  </div>
                </div>

                {/* Question */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl mb-6 font-medium text-white">{quizData.question}</h2>

                  <div className="space-y-3">
                    {quizData.options.map((option, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={!showResult ? { scale: 1.01, x: 4 } : {}}
                        onClick={() => !showResult && setSelectedOption(option)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all 
                          ${showResult && option === quizData.answer 
                            ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-900/20' 
                            : showResult && option === selectedOption && option !== quizData.answer 
                              ? 'bg-red-900/30 border-red-500 shadow-lg shadow-red-900/20' 
                              : selectedOption === option 
                                ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-900/20' 
                                : 'bg-gray-800/70 border-gray-700 hover:border-gray-600'
                          }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center 
                            ${selectedOption === option 
                              ? 'border-purple-500' 
                              : showResult && option === quizData.answer 
                                ? 'border-green-500' 
                                : 'border-gray-600'
                            }`}>
                            {showResult && option === quizData.answer ? (
                              <CheckCircle size={16} className="text-green-400" />
                            ) : showResult && option === selectedOption && option !== quizData.answer ? (
                              <XCircle size={16} className="text-red-400" />
                            ) : selectedOption === option ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 bg-purple-400 rounded-full"
                              />
                            ) : null}
                          </div>
                          <span className="text-white">{option}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Result Explanation */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-8 overflow-hidden"
                    >
                      <div className={`p-5 rounded-xl ${isCorrect 
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50' 
                        : 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/50'}`}
                      >
                        <div className="flex items-center mb-2">
                          {isCorrect ? (
                            <CheckCircle className="text-green-400 mr-2" size={20} />
                          ) : (
                            <XCircle className="text-red-400 mr-2" size={20} />
                          )}
                          <h3 className="font-bold text-lg">
                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                          </h3>
                        </div>
                        <p className="text-gray-300">{quizData.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Button */}
                <motion.div
                  className="flex justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {!showResult ? (
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCheck}
                      disabled={!selectedOption}
                      className={`px-8 py-3 rounded-xl font-medium transition-all 
                        ${selectedOption
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Check Answer
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNext}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-900/20 text-white hover:shadow-xl hover:shadow-purple-900/30"
                    >
                      {questionNumber >= 10 ? 'Complete Assessment' : 'Next Question'}
                    </motion.button>
                  )}
                </motion.div>
              </>
            )}

            {/* Quiz Report */}
            {quizFinished && report && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.3
                    }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg mb-4"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ 
                        duration: 0.8,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1],
                        repeat: 0
                      }}
                    >
                      <Award className="w-10 h-10 text-white" />
                    </motion.div>
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
                  <p className="text-gray-400 max-w-md">Your skills have been evaluated based on your answers to the assessment questions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                  <div className="md:col-span-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                    {/* Basic results */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{skill.charAt(0).toUpperCase() + skill.slice(1)} Assessment</h3>
                        <span className="px-3 py-1 bg-purple-900/50 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300">
                          Level: {report.levelReached.charAt(0).toUpperCase() + report.levelReached.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Based on your performance, you've demonstrated {report.levelReached} level knowledge in {skill}.
                      </p>
                    </div>

                    {/* Accuracy gauge */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-400">Accuracy Score</div>
                        <div className="text-xl font-bold">{report.accuracy.toFixed(1)}%</div>
                      </div>
                      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${report.accuracy >= 80 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : report.accuracy >= 50 
                              ? 'bg-gradient-to-r from-yellow-500 to-amber-500' 
                              : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${report.accuracy}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Skill assessment summary */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Assessment Summary</h4>
                      <p className="text-gray-300 text-sm">
                        {report.accuracy >= 80
                          ? `Excellent work! You have demonstrated ${report.levelReached}-level knowledge in ${skill}. Your strong performance indicates a deep understanding of the subject.`
                          : report.accuracy >= 60
                            ? `Good job! You have solid ${report.levelReached}-level understanding of ${skill}. With some additional practice, you can further enhance your expertise.`
                            : `You have a basic knowledge of ${skill}. Regular practice and learning would help you improve your skills significantly.`
                        }
                      </p>
                    </div>

                    {/* Next steps */}
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Next Steps</h4>
                      <ul className="space-y-2 text-gray-300 text-sm">
                        <li className="flex items-start">
                          <div className="text-purple-400 mr-2">•</div>
                          <span>Continue practicing with more advanced {skill} assessments</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-purple-400 mr-2">•</div>
                          <span>Explore related skills to expand your knowledge base</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-purple-400 mr-2">•</div>
                          <span>Add this skill to your professional profile to showcase your expertise</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Results cards */}
                  <div className="md:col-span-3 space-y-5">
                    <motion.div 
                      className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Total Questions</div>
                          <div className="text-2xl font-bold">{report.totalQuestions}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 p-5 rounded-xl border border-green-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Correct Answers</div>
                          <div className="text-2xl font-bold text-green-400">{report.correctAnswers}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-red-900/30 to-orange-900/20 p-5 rounded-xl border border-red-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Wrong Answers</div>
                          <div className="text-2xl font-bold text-red-400">{report.wrongAnswers}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-900/50 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-400" />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-5 rounded-xl border border-indigo-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-gray-400 text-sm mb-1">Skill Level Reached</div>
                          <div className="text-2xl font-bold text-indigo-400 capitalize">{report.levelReached}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center">
                          <Award className="w-5 h-5 text-indigo-400" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium shadow-lg shadow-purple-900/20 text-white"
                  >
                    Test Another Skill
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-5 rounded-xl shadow-xl border border-gray-800 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200/20 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">Generating questions for {skill}...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* API Error Message */}
      {apiError && !loading && (
        <div className="fixed top-4 right-4 bg-red-900/70 border border-red-500/50 p-4 rounded-lg shadow-lg z-50 max-w-md transition-opacity">
          <div className="flex items-start">
            <XCircle className="text-red-400 mr-2 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-semibold text-red-300">Error Loading Quiz</h4>
              <p className="text-xs text-red-200 mt-1">{apiError}</p>
              <p className="text-xs text-red-300 mt-2 italic">Using fallback questions instead</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}