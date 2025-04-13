// components/SkillMatchChart.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';


export const SkillMatchChart: React.FC<any> = ({ role }) => {
  const data = [
    { name: 'Match Score', value: parseFloat(role.match_score.toFixed(2)) },
    ...role.skills.map((skill : any) => ({
      name: skill,
      value: 1,
    })),
  ];

  return (
    <div className="p-4 rounded-xl shadow-md border mb-6">
      <h2 className="text-xl font-semibold mb-2">{role.title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
