'use client';

import React, { useEffect, useState } from 'react';
import sampleData from './sample_data.js';
import dynamic from 'next/dynamic';

const UserMap = dynamic(() => import('@/components/mapComponent.tsx'), { ssr: false });

export default function Page() {
  const [userData, setUserData] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    setUserData(sampleData);
  }, []);

  const allSkills = [...new Set(userData.flatMap(user => user.skills))];
  const allCompanies = [...new Set(userData.map(user => user.company))];

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">🌐 Career Network Map</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)} className="p-2 border rounded">
          <option value="">Filter by Skill</option>
          {allSkills.map((skill, idx) => (
            <option key={idx} value={skill}>{skill}</option>
          ))}
        </select>

        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="p-2 border rounded">
          <option value="">Filter by Company</option>
          {allCompanies.map((company, idx) => (
            <option key={idx} value={company}>{company}</option>
          ))}
        </select>
      </div>

      {userData.length > 0 && (
        <UserMap
          users={userData}
          selectedSkill={selectedSkill}
          selectedCompany={selectedCompany}
        />
      )}
    </div>
  );
}
