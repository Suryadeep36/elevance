'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import sampleData from './sample_data.js';
import dynamic from 'next/dynamic';
import { MapPin, Users, Briefcase, Filter, Search, Code, X, Globe, Map as MapIcon } from 'lucide-react';

// Import the map component dynamically to avoid SSR issues with Leaflet
const UserMap = dynamic(() => import('@/components/mapComponent.tsx'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-xl">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-t-purple-500 border-purple-200/20 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">Loading map...</p>
      </div>
    </div>
  )
});

export default function NetworkPage() {
  const [userData, setUserData] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<'simple' | '3d'>('simple');
  
  // Load user data and preferences on component mount
  useEffect(() => {
    setUserData(sampleData);
    
    // Load saved map view preference from localStorage
    const savedViewMode = localStorage.getItem('mapViewMode');
    if (savedViewMode && (savedViewMode === 'simple' || savedViewMode === '3d')) {
      setMapViewMode(savedViewMode as 'simple' | '3d');
    }
    
    // Set a flag after a delay to ensure client-side hydration
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Save map view preference when it changes
  useEffect(() => {
    localStorage.setItem('mapViewMode', mapViewMode);
  }, [mapViewMode]);

  // Extract all unique skills and companies from userData
  const allSkills = [...new Set(userData.flatMap(user => user.skills))];
  const allCompanies = [...new Set(userData.map(user => user.company))];

  // Filter users based on selected criteria
  const filteredUsers = userData.filter(user => {
    const matchesSkill = !selectedSkill || user.skills.includes(selectedSkill);
    const matchesCompany = !selectedCompany || user.company === selectedCompany;
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSkill && matchesCompany && matchesSearch;
  });

  // Toggle map view mode
  const toggleMapView = () => {
    setMapViewMode(mapViewMode === 'simple' ? '3d' : 'simple');
  };

  return (
    <div className="min-h-full">
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
            Career Network
          </h1>
          <div className="text-sm text-gray-400 flex items-center">
            <Users size={16} className="mr-2" />
            {userData.length} professionals in your network
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Filters and User Cards */}
        <div className="space-y-6">
          {/* Search and filters */}
          <motion.div 
            className="backdrop-blur-sm bg-white/5 rounded-xl border border-gray-800 shadow-xl p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Filters</h3>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-purple-400 hover:text-purple-300 text-xs flex items-center"
                >
                  <Filter size={14} className="mr-1" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter by Skill</label>
                      <select 
                        value={selectedSkill} 
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                      >
                        <option value="">Any Skill</option>
                        {allSkills.map((skill, idx) => (
                          <option key={idx} value={skill}>{skill}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter by Company</label>
                      <select 
                        value={selectedCompany} 
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm"
                      >
                        <option value="">Any Company</option>
                        {allCompanies.map((company, idx) => (
                          <option key={idx} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>

                    {(selectedSkill || selectedCompany) && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedSkill('');
                            setSelectedCompany('');
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* User cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-white text-lg font-medium flex items-center">
              <Users size={18} className="mr-2 text-purple-400" />
              {filteredUsers.length} {filteredUsers.length === 1 ? 'Professional' : 'Professionals'}
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {filteredUsers.map((user, idx) => (
                  <motion.div 
                    key={user.name}
                    className={`backdrop-blur-sm bg-white/5 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      selectedUser === user 
                        ? 'border-purple-500 shadow-lg shadow-purple-900/20' 
                        : 'border-gray-800/50 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedUser(user)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-medium text-white mr-3">
                          {user.name.split(' ').map((name: string) => name[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{user.name}</h3>
                          <p className="text-gray-400 text-sm truncate">{user.title}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-start text-sm">
                        <Briefcase size={14} className="text-gray-500 mt-0.5 mr-2" />
                        <p className="text-gray-400">{user.company}</p>
                      </div>
                      
                      <div className="mt-2 flex items-start text-sm">
                        <MapPin size={14} className="text-gray-500 mt-0.5 mr-2" />
                        <p className="text-gray-400">{user.location}</p>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1.5">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {user.skills.slice(0, 3).map((skill: string, i: number) => (
                            <span 
                              key={i} 
                              className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 3 && (
                            <span className="inline-block bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
                              +{user.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl bg-gray-800/30">
                  <Search size={32} className="text-gray-600 mb-3" />
                  <p className="text-gray-500">No professionals found</p>
                  <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right column: Map */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="backdrop-blur-sm bg-white/5 rounded-xl border border-gray-800 shadow-xl overflow-hidden h-[700px] relative">
            {/* Map view toggle */}
            {/* <div className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 p-1 shadow-xl">
              <div className="flex">
                <button
                  onClick={() => setMapViewMode('simple')}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                    mapViewMode === 'simple' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MapIcon size={14} className="mr-1.5" />
                  Simple
                </button>
                <button
                  onClick={() => setMapViewMode('3d')}
                  className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                    mapViewMode === '3d' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Globe size={14} className="mr-1.5" />
                  3D View
                </button>
              </div>
            </div> */}

            {/* Map */}
            {mapLoaded && userData.length > 0 && (
              <UserMap
                users={userData}
                selectedSkill={selectedSkill}
                selectedCompany={selectedCompany}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                viewMode={mapViewMode}
              />
            )}
          </div>
          
          {/* Selected user details panel */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div 
                className="mt-4 backdrop-blur-sm bg-white/5 rounded-xl border border-gray-800 shadow-xl p-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-medium text-white text-lg mr-4">
                      {selectedUser.name.split(' ').map((name: string) => name[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                      <p className="text-purple-400">{selectedUser.title}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Company</p>
                      <div className="flex items-center mt-1">
                        <Briefcase size={16} className="text-gray-400 mr-2" />
                        <p className="text-white">{selectedUser.company}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <div className="flex items-center mt-1">
                        <MapPin size={16} className="text-gray-400 mr-2" />
                        <p className="text-white">{selectedUser.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill: string, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-center bg-gray-800/80 text-white text-sm px-3 py-1.5 rounded-full"
                        >
                          <Code size={12} className="mr-1.5 text-purple-400" />
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 flex justify-end">
                  <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg text-sm shadow-lg flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Connect
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
