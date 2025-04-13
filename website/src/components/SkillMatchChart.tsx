import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface SkillMatchChartProps {
  recommendedRoles: {
    title: string;
    skills: string[];
    match_score: number;
  }[];
}

export const SkillMatchChart: React.FC<SkillMatchChartProps> = ({ recommendedRoles }) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Format the data for the chart
  const chartData = recommendedRoles.map(role => ({
    name: role.title,
    score: Math.round(role.match_score * 100),
    skills: role.skills,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="font-bold text-blue-400">{data.name}</p>
          <p className="text-gray-300">Match Score: {data.score}%</p>
          <div className="mt-2">
            <p className="text-sm text-gray-400">Required Skills:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.skills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const handleRoleClick = (role: string) => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 p-6 rounded-xl shadow-xl"
    >
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-white mb-6"
      >
        Career Match Analysis
      </motion.h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#9CA3AF' }} 
              width={150}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="score" 
              radius={[0, 4, 4, 0]}
              onClick={(data) => handleRoleClick(data.name)}
              onMouseEnter={(data) => setHoveredRole(data.name)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredRole === entry.name || selectedRole === entry.name ? '#3B82F6' : '#6366F1'}
                  cursor="pointer"
                  style={{
                    filter: hoveredRole === entry.name || selectedRole === entry.name ? 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))' : 'none',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {selectedRole && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            {selectedRole} Details
          </h3>
          <div className="text-gray-300">
            <p className="mb-2">Required skills:</p>
            <div className="flex flex-wrap gap-2">
              {chartData.find(role => role.name === selectedRole)?.skills.map((skill, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Click on any other role to view its details or click this role again to collapse.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-sm text-gray-400"
      >
        <p>Click on any bar to see more details about the role and required skills.</p>
      </motion.div>
    </motion.div>
  );
};