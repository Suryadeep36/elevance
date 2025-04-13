"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

// Define TypeScript interfaces
interface User {
  id: number;
  username: string;
  badges: number;
  clusters: string[];
}

interface ClusterColors {
  [key: string]: string;
}

// Define our dummy data
const dummyUsers: User[] = [
  { id: 1, username: 'techguru99', badges: 5, clusters: ['Cloud Computing', 'Machine Learning', 'Web Dev', 'App Dev', 'Cyber Security'] },
  { id: 2, username: 'codemaster', badges: 4, clusters: ['Web Dev', 'App Dev', 'Cloud Computing', 'Cyber Security'] },
  { id: 3, username: 'datawhiz', badges: 5, clusters: ['Machine Learning', 'Cloud Computing', 'Web Dev', 'App Dev', 'Cyber Security'] },
  { id: 4, username: 'devninja', badges: 3, clusters: ['Web Dev', 'App Dev', 'Cloud Computing'] },
  { id: 5, username: 'securitypro', badges: 4, clusters: ['Cyber Security', 'Cloud Computing', 'Web Dev', 'Machine Learning'] },
  { id: 6, username: 'cloudmaster', badges: 5, clusters: ['Cloud Computing', 'Web Dev', 'App Dev', 'Machine Learning', 'Cyber Security'] },
  { id: 7, username: 'aiexplorer', badges: 3, clusters: ['Machine Learning', 'Cloud Computing', 'Web Dev'] },
  { id: 8, username: 'appdeveloper', badges: 4, clusters: ['App Dev', 'Web Dev', 'Cloud Computing', 'Machine Learning'] },
  { id: 9, username: 'webwizard', badges: 2, clusters: ['Web Dev', 'App Dev'] },
  { id: 10, username: 'hackdefender', badges: 4, clusters: ['Cyber Security', 'Cloud Computing', 'Web Dev', 'Machine Learning'] },
];

// Sort users by badge count (highest to lowest)
const sortedUsers = [...dummyUsers].sort((a, b) => b.badges - a.badges);

// Map cluster names to colors
const clusterColors: ClusterColors = {
  'Cloud Computing': 'bg-blue-500',
  'Web Dev': 'bg-purple-500',
  'Machine Learning': 'bg-green-500',
  'App Dev': 'bg-orange-500',
  'Cyber Security': 'bg-red-500',
};

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>(sortedUsers);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(sortedUsers);

  useEffect(() => {
    const results = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-xl w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Skill Master Leaderboard</h1>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 bg-gray-700 p-4 text-gray-300 font-semibold">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-3">Username</div>
            <div className="col-span-2 text-center">Badges</div>
            <div className="col-span-6">Skill Clusters</div>
          </div>
          
          {/* User List */}
          <AnimatePresence>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`grid grid-cols-12 p-4 items-center ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'} hover:bg-gray-700 transition-colors duration-150`}
                >
                  <div className="col-span-1 text-center font-semibold text-lg text-gray-400">{index + 1}</div>
                  <div className="col-span-3 font-medium text-blue-400">{user.username}</div>
                  <motion.div 
                    className="col-span-2 text-center font-bold text-yellow-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {user.badges}
                  </motion.div>
                  <div className="col-span-6 flex flex-wrap gap-2">
                    {user.clusters.map((cluster, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 + i * 0.1 }}
                        className={`${clusterColors[cluster]} px-2 py-1 rounded-full text-xs font-medium`}
                      >
                        {cluster}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-400"
              >
                No users found matching "{searchTerm}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;