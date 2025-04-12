'use client';

import React, { useEffect, useState } from 'react';
import sampleData from './sample_data.js';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const UserMap = dynamic(() => import('@/components/mapComponent.tsx'), { ssr: false });

export default function Page() {
  const [userData, setUserData] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  useEffect(() => {
    setUserData(sampleData);
  }, []);

  const allSkills = [...new Set(userData.flatMap(user => user.skills))];
  const allCompanies = [...new Set(userData.map(user => user.company))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
      >
        🌐 Career Network Map
      </motion.h1>

      <div className="flex flex-wrap gap-6 mb-8">
        {/* Skill Select Dropdown */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsSkillOpen(!isSkillOpen)}
            className="flex items-center justify-between w-64 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"
          >
            <span>{selectedSkill || "Filter by Skill"}</span>
            <motion.span
              animate={{ rotate: isSkillOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isSkillOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
              >
                <motion.ul className="max-h-60 overflow-y-auto">
                  <motion.li
                    whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.5)' }}
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => {
                      setSelectedSkill('');
                      setIsSkillOpen(false);
                    }}
                  >
                    All Skills
                  </motion.li>
                  {allSkills.map((skill, idx) => (
                    <motion.li
                      key={idx}
                      whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.5)' }}
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => {
                        setSelectedSkill(skill);
                        setIsSkillOpen(false);
                      }}
                    >
                      {skill}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Company Select Dropdown */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            className="flex items-center justify-between w-64 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"
          >
            <span>{selectedCompany || "Filter by Company"}</span>
            <motion.span
              animate={{ rotate: isCompanyOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={18} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isCompanyOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
              >
                <motion.ul className="max-h-60 overflow-y-auto">
                  <motion.li
                    whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.5)' }}
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => {
                      setSelectedCompany('');
                      setIsCompanyOpen(false);
                    }}
                  >
                    All Companies
                  </motion.li>
                  {allCompanies.map((company, idx) => (
                    <motion.li
                      key={idx}
                      whileHover={{ backgroundColor: 'rgba(107, 114, 128, 0.5)' }}
                      className="px-4 py-2 cursor-pointer"
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsCompanyOpen(false);
                      }}
                    >
                      {company}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedSkill}-${selectedCompany}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {userData.length > 0 && (
            <UserMap
              users={userData}
              selectedSkill={selectedSkill}
              selectedCompany={selectedCompany}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}