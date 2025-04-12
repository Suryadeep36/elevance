"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ElevanceLoader from '@/components/loader';
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



  // Level progression mapping
  const levels = ["beginner", "intermediate", "advanced", "expert"];

  const setData = async() => {
    const response = await axios.post("/api/gemini/quiz", {
      quizes,
      level,
      skill,
    });

    console.log(response.data.quiz)
    setquizes((prev) => [...prev, response.data.quiz]);
    setQuizData(response.data.quiz);
  }

  // Fetch a new quiz question
  async function fetchQuiz() {
    setloading(true);
    try {
      await setData();
    } catch (error) {
      console.error("Error fetching quiz:", error);
      let trys = 10;
      while(trys > 0){
        try{
          await setData();
          setloading(false)
          return;
        }
        catch(err){
          trys--;
        }
      }
      setloading(false)
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
    <div className=" flex items-center justify-center min-h-screen bg-gray-900 text-white p-4 overflow-hidden">
      {/* {loading ? <ElevanceLoader/> : <></>} */}
      <motion.div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-gray-900 opacity-50"></div>
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-20"
          animate={{
            x: [0, -30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
        />

        {/* Quiz content */}
        <div className="relative backdrop-blur-sm bg-gray-900 bg-opacity-80 p-8 rounded-xl shadow-2xl border border-gray-800">
          <motion.h1
            className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Skill Assessment Quiz
          </motion.h1>

          {/* Skill Selection */}
          {!quizStarted && !quizFinished && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="space-y-6">
                {/* Skill Input Field */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2"
                >
                  <label
                    htmlFor="skill-input"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Select Your Skill
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <input
                      id="skill-input"
                      type="text"
                      onChange={(evt) => setSkill(evt.target.value)}
                      value={skill}
                      placeholder="e.g. JavaScript, React, Python"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                    />
                    {skill && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setSkill('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Clear input"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>

                {/* Start Quiz Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: "0 5px 15px rgba(124, 58, 237, 0.4)"
                    }}
                    whileTap={{
                      scale: 0.97,
                      boxShadow: "0 2px 5px rgba(124, 58, 237, 0.2)"
                    }}
                    onClick={startQuiz}
                    disabled={!skill}
                    className={`w-full px-6 py-3 rounded-lg font-medium text-lg transition-all ${skill
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Start Quiz
                    {skill && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-2 inline-block"
                      >
                        🚀
                      </motion.span>
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Quiz Questions */}
          {quizStarted && !quizFinished && quizData && (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Question {questionNumber}/10</span>
                  <span>Level: {level.charAt(0).toUpperCase() + level.slice(1)}</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    initial={{ width: `${(questionNumber - 1) * 10}%` }}
                    animate={{ width: `${questionNumber * 10}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Score */}
              <div className="flex justify-between mb-6 text-sm">
                <span className="text-green-400">✓ Correct: {correctAnswers}</span>
                <span className="text-red-400">✗ Wrong: {wrongAnswers}</span>
              </div>

              {/* Question */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl mb-6 font-medium">{quizData.question}</h2>

                <div className="space-y-3">
                  {quizData.options.map((option, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !showResult && setSelectedOption(option)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${showResult && option === quizData.answer ? 'bg-green-900 border-green-500' :
                          showResult && option === selectedOption && option !== quizData.answer ? 'bg-red-900 border-red-500' :
                            selectedOption === option ? 'bg-gray-700 border-purple-500' : 'bg-gray-800 border-gray-700'
                        }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${selectedOption === option ? 'border-purple-500' : 'border-gray-500'
                          }`}>
                          {selectedOption === option && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-3 h-3 bg-purple-400 rounded-full"
                            />
                          )}
                        </div>
                        <span>{option}</span>
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
                    className="mb-6 overflow-hidden"
                  >
                    <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
                      <p className="font-bold mb-2">
                        {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                      </p>
                      <p className="text-sm">{quizData.explanation}</p>
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCheck}
                    disabled={!selectedOption}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedOption
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Check Answer
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium shadow-lg"
                  >
                    {questionNumber >= 10 ? 'Finish Quiz' : 'Next Question'}
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
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                <p className="text-gray-400">Here's your skill assessment report</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium">{skill.charAt(0).toUpperCase() + skill.slice(1)} Assessment</h3>
                  <span className="px-3 py-1 bg-purple-900 rounded-full text-sm">
                    Level: {report.levelReached.charAt(0).toUpperCase() + report.levelReached.slice(1)}
                  </span>
                </div>

                <div className="mb-6">
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.accuracy}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Accuracy</span>
                    <span>{report.accuracy.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">Correct Answers</h4>
                    <p className="text-2xl font-bold text-green-400">{report.correctAnswers}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm text-gray-400 mb-1">Wrong Answers</h4>
                    <p className="text-2xl font-bold text-red-400">{report.wrongAnswers}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Total Questions</h4>
                  <p className="text-2xl font-bold">{report.totalQuestions}</p>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Skill Assessment Summary:</h4>
                  <p className="text-gray-300 text-sm">
                    {report.accuracy >= 80
                      ? `Excellent work! You have demonstrated ${report.levelReached}-level knowledge in ${skill}.`
                      : report.accuracy >= 60
                        ? `Good job! You have solid ${report.levelReached}-level understanding of ${skill}.`
                        : `You have basic knowledge of ${skill}. Keep practicing to improve your skills!`
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium shadow-lg"
                >
                  Try Another Skill
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}