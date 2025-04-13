'use client'
import React, { useState } from 'react';
import axios from 'axios';

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

    const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDesiredSkills(e.target.value);
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
        } catch (err) {
            setError('Failed to get recommendations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Path Recommender</h1>
                    <p className="text-lg text-gray-600">
                        Discover the best career paths and courses based on your skills and interests
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="desired_skills" className="block text-sm font-medium text-gray-700">
                                Skills You Want to Learn (comma separated)
                            </label>
                            <textarea
                                id="desired_skills"
                                name="desired_skills"
                                rows={2}
                                value={desiredSkills}
                                onChange={handleSkillsChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                placeholder="Machine Learning, Deep Learning, AI"
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                            >
                                {loading ? 'Getting Recommendations...' : 'Get Career Recommendations'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                {recommendations.length > 0 && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900">Recommended Career Paths</h2>

                        {recommendations.map((recommendation, index) => (
                            <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{recommendation.career_role}</h3>
                                            <p className="text-indigo-600 font-medium mt-1">
                                                Match Score: {(recommendation.match_score * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-3">Recommended Courses</h4>
                                        <div className="space-y-4">
                                            {recommendation.recommended_courses.map((course, courseIndex) => (
                                                <div key={courseIndex} className="border-l-4 border-indigo-200 pl-4 py-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">{course.course}</h5>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                <span className="font-medium">Skills:</span> {course.skills}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                ★ {course.rating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                                        <span>Duration: {course.duration}</span>
                                                        <span>Reviews: {course.reviewcount}</span>
                                                        <span className="text-indigo-600">
                                                            Relevance: {(course.similarity * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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