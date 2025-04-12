"use client"
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Code, Lightbulb, TrendingUp, Briefcase, ArrowRight } from "lucide-react";
import JobInsights from "@/components/JobInsights";

// This would be your existing Insights component
const Insights = () => {
  return (
    <div>
      <JobInsights />
    </div>
  );
};

interface Recommendation {
  id: string;
  title: string;
  company?: string;
  type: 'job' | 'course' | 'skill';
  description: string;
  link?: string;
  imageUrl?: string;
}

const Recommendations = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'jobs' | 'courses' | 'skills'>('all');

  // Load skills from localStorage
  useEffect(() => {
    try {
      // Try to get skills from localStorage
      const profileData = localStorage.getItem('profileData');
      const savedSkills = localStorage.getItem('skills');

      if (savedSkills) {
        setSkills(JSON.parse(savedSkills));
      } else if (profileData) {
        // If no dedicated skills key, try to extract from profile data
        const parsedData = JSON.parse(profileData);
        if (parsedData.skills && Array.isArray(parsedData.skills)) {
          setSkills(parsedData.skills);
        }
        console.log(parsedData)
      }
    } catch (err) {
      console.error("Error loading skills from localStorage:", err);
      setSkills([]);
    }
  }, []);

  // Function to convert API job data to recommendation format
  interface Job {
    Job_Title: string;
    Industry: string;
    Location: string;
    Required_Skills: string;
    Remote_Friendly: boolean;
  }

  const mapJobsToRecommendations = (jobs: Job[]): Recommendation[] => {
    return jobs.map((job, index) => ({
      id: `job-${index}`,
      title: job.Job_Title,
      company: job.Industry, // You might want to change this if you have actual company names
      type: 'job',
      description: `${job.Job_Title} in ${job.Industry} (${job.Location}). Required skills: ${job.Required_Skills}. Remote: ${job.Remote_Friendly}.`
    }));
  };

  // Fetch recommendations when skills are loaded
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (skills.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // This would be your actual API endpoint
        // This would be your actual API endpoint
        console.log(skills)
        const response = await axios.post('http://localhost:8000/recommend-jobs', skills);

        // The issue is here - you need to extract the recommended_jobs array
        console.log(response.data);
        // Change this line:
        setRecommendations(response.data );
        // To this:
        setRecommendations(
          response.data && response.data.recommended_jobs
            ? mapJobsToRecommendations(response.data.recommended_jobs)
            : []
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        // For demo purposes, use mock data when API fails
       
        setLoading(false);
        setError("Could not fetch live recommendations. Showing sample matches instead.");
      }
    };

    fetchRecommendations();
  }, [skills]);

  // Create mock recommendations based on skills for demo purposes
 

  // Filter recommendations by category
  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(rec =>
      activeCategory === 'jobs' ? rec.type === 'job' :
        activeCategory === 'courses' ? rec.type === 'course' :
          rec.type === 'skill'
    );

  const getIconForType = (type: 'job' | 'course' | 'skill') => {
    switch (type) {
      case 'job':
        return <Briefcase className="text-blue-400" size={18} />;
      case 'course':
        return <Lightbulb className="text-yellow-400" size={18} />;
      case 'skill':
        return <Code className="text-green-400" size={18} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="scroll-container overflow-y-auto pb-8" style={{ maxHeight: 'calc(100vh - 180px)' }}
    >
      {/* Title and filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h3 className="text-xl font-semibold text-gray-100 flex items-center">
          <TrendingUp size={20} className="mr-2 text-purple-400" />
          Smart Recommendations
        </h3>

        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('jobs')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeCategory === 'jobs'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveCategory('courses')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeCategory === 'courses'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveCategory('skills')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeCategory === 'skills'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            Skills
          </button>
        </div>
      </div>

      {/* Skills pills - Only showing a few for context */}
      {skills.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2 pb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {skills.slice(0, 5).map((skill, idx) => (
            <motion.span
              key={idx}
              className="bg-gray-800 text-sm text-gray-300 px-3 py-1 rounded-full border border-gray-700"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * idx }}
            >
              {skill}
            </motion.span>
          ))}
          {skills.length > 5 && (
            <motion.span
              className="bg-gray-800 text-sm text-gray-400 px-3 py-1 rounded-full border border-gray-700"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              +{skills.length - 5} more
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-t-purple-500 border-r-purple-500 border-b-gray-700 border-l-gray-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Finding the best matches for your skills...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-gray-800 border-l-4 border-yellow-500 p-4 rounded-md">
          <p className="text-yellow-200 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && recommendations.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <Code size={32} className="text-gray-500" />
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">No recommendations yet</h4>
          <p className="text-gray-500 max-w-md">
            Add skills to your profile or upload your resume to get personalized recommendations.
          </p>
        </motion.div>
      )}

      {/* Recommendations grid */}
      {!loading && filteredRecommendations.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
        >
          <AnimatePresence>
            {filteredRecommendations.map((rec, idx) => (
              <motion.div
                key={rec.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {getIconForType(rec.type)}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-gray-500">
                        {rec.type}
                      </span>
                    </div>
                    
                  </div>

                  <h4 className="text-lg font-medium text-gray-100 mb-1">
                    {rec.title}
                  </h4>

                  {rec.company && (
                    <p className="text-sm text-gray-400 mb-3">{rec.company}</p>
                  )}

                  <p className="text-sm text-gray-400 mb-4">
                    {rec.description}
                  </p>

                  <div className="flex justify-end">
                    <motion.button
                      className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <span>View details</span>
                      <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>

                {/* Colored bar at bottom based on type */}
                <div className={`h-1 w-full 
                  ${rec.type === 'job' ? 'bg-blue-500' :
                    rec.type === 'course' ? 'bg-yellow-500' :
                      'bg-green-500'}`}
                ></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

interface TabbedComponentProps {
  // You may need to add additional props
}

const TabbedComponent: React.FC<TabbedComponentProps> = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations'>('insights');

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between border-b border-gray-700 pb-4 mb-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('insights')}
            className={`pb-2 text-lg font-medium transition-all relative ${activeTab === 'insights'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            Insights
            {activeTab === 'insights' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
                layoutId="activeTabLine"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-2 text-lg font-medium transition-all relative ${activeTab === 'recommendations'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            Recommendations
            {activeTab === 'recommendations' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"
                layoutId="activeTabLine"
              />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'insights' ? (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Insights />
          </motion.div>
        ) : (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Recommendations />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TabbedComponent;