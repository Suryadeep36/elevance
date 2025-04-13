'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { useUser, useAuth } from "@clerk/nextjs";

interface RecommendedCourse {
    course: string;
    skills: string;
    rating: number;
    reviewcount: string;
    duration: string;
    similarity: number;
}

interface CareerRecommendation {
    career_role: string;
    match_score: number;
    recommended_courses: RecommendedCourse[];
}

export default function CareerRecommender() {
    const [desiredSkills, setDesiredSkills] = useState<string>("");
    const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isLoaded, user } = useUser();
    const { isSignedIn } = useAuth();

    const sendEmail = async (to: any, subject: any, text: any, html: any) => {
        const res = await fetch('/api/sendMail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                text,
                html,
            }),
        });

        const data = await res.json();
        console.log(data);
    };


    const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDesiredSkills(e.target.value);
    };

    const generateHTML = (careerPaths: any) => {
        let html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello,</h2>
            <p>Based on the skills you provided, here are some recommended career paths for you:</p>
            <ul style="padding-left: 20px;">
        `;

        careerPaths.forEach((path: any) => {
            html += `
            <li style="margin-bottom: 15px;">
              <strong>${path.title}</strong><br/>
              <span>${path.description}</span>
            </li>
          `;
        });

        html += `
            </ul>
            <p>Best regards,<br/>Career Recommendation Team</p>
          </div>
        `;

        return html;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const skillsArray = desiredSkills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0);
            const response = await axios.post('http://localhost:8000/recommend-career-path', skillsArray);
            setRecommendations(response.data.recommended_careers);

            const careerPaths = response.data.recommendedCareerPaths;

            const html = generateHTML(careerPaths);

            const subject = "Recommendation of cource based on skills" + skillsArray;
            const text = `Hello, Based on the skills you provided, here are some recommended career paths for you:\n\n`;
            const to = user?.primaryEmailAddress?.emailAddress

            sendEmail(to, subject, text, html);
        } catch (err) {
            setError('Failed to get recommendations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white mb-3 font-sora">Career Path Recommender</h1>
                    <p className="text-lg text-white max-w-2xl mx-auto">
                        Discover the best career paths and courses based on your skills and interests
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-xl p-8 mb-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="desired_skills" className="block text-lg font-medium text-gray-800 mb-2">
                                What skills are you interested in learning?
                            </label>
                            <textarea
                                id="desired_skills"
                                name="desired_skills"
                                rows={3}
                                value={desiredSkills}
                                onChange={handleSkillsChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-4 border bg-gray-50 text-gray-800"
                                placeholder="Enter skills separated by commas (e.g., HTML, CSS, JavaScript, React)"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Tip: Add more specific skills for better recommendations
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 text-base font-medium rounded-lg shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-all duration-200"
                            >
                                {loading ? 'Analyzing Skills...' : 'Get Career Recommendations'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-md">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        <span className="ml-3 text-lg font-medium text-indigo-600">Analyzing your skills...</span>
                    </div>
                )}

                {!loading && recommendations.length > 0 && (
                    <div className="space-y-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-sora">Recommended Career Paths</h2>

                        {recommendations.map((recommendation, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 px-8 py-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold text-white font-sora">{recommendation.career_role}</h3>
                                        <div className="flex items-center">
                                            <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center shadow-lg">
                                                <span className="text-xl font-bold text-indigo-700">
                                                    {Math.round(recommendation.match_score * 100)}%
                                                </span>
                                            </div>
                                            <span className="ml-3 text-white font-medium">Match Score</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center font-sora">
                                        <svg className="w-6 h-6 mr-2 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Recommended Courses
                                    </h4>

                                    <div className="space-y-6">
                                        {recommendation.recommended_courses.map((course, courseIndex) => (
                                            <div key={courseIndex} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
                                                <div className="flex justify-between">
                                                    <div className="flex-1">
                                                        <h5 className="text-xl font-semibold text-gray-900 mb-3">{course.course}</h5>

                                                        <div className="mt-4 mb-2">
                                                            <div className="text-sm font-medium text-gray-500 mb-1">SKILLS</div>
                                                            <p className="text-gray-700 text-sm">
                                                                {course.skills.replace(/[{}"]/g, '')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end ml-6 space-y-2">
                                                        <div className="flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full">
                                                            <svg className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="font-bold text-lg">{course.rating}</span>
                                                        </div>
                                                        <div className="text-gray-500 text-sm font-medium">
                                                            {course.reviewcount} reviews
                                                        </div>
                                                        <div className="flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full mt-1">
                                                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {course.duration}
                                                        </div>
                                                        <div className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full mt-1">
                                                            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            Relevance: {Math.round(course.similarity * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}