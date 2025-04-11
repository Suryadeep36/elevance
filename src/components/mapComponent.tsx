'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface User {
  name: string;
  title: string;
  company: string;
  skills: string[];
  lat: number;
  lon: number;
}

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  color: string;
  name: string;
  title: string;
  company: string;
  skills: string;
}

export default function UserMap({ users, selectedSkill, selectedCompany }: {
  users: User[],
  selectedSkill: string,
  selectedCompany: string
}) {
  const [points, setPoints] = useState<GlobePoint[]>([]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const skillMatch = selectedSkill === '' || user.skills.includes(selectedSkill);
      const companyMatch = selectedCompany === '' || user.company === selectedCompany;
      return skillMatch && companyMatch;
    });

    const formatted: GlobePoint[] = filtered.map(user => ({
      lat: user.lat,
      lng: user.lon,
      size: 0.6,
      color: 'orange',
      name: user.name,
      title: user.title,
      company: user.company,
      skills: user.skills.join(', ')
    }));

    setPoints(formatted);
  }, [users, selectedSkill, selectedCompany]);

  return (
    <div style={{ height: '600px' }}>
      <Globe
    globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"


        pointsData={points}
        pointAltitude="size"
        pointColor="color"
        pointLabel={(d: any) =>
          `<b>${d.name}</b><br/>${d.title}<br/>${d.company}<br/>Skills: ${d.skills}`
        }
      />
    </div>
  );
}
