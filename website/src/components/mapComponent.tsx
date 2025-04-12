'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Star, CircleDot } from 'lucide-react';

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
  skills: string[];
}

export default function UserMap({ users, selectedSkill, selectedCompany }: {
  users: User[],
  selectedSkill: string,
  selectedCompany: string
}) {
  const [points, setPoints] = useState<GlobePoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<GlobePoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GlobePoint | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Color scheme for different companies
  const companyColors: Record<string, string> = {
    'Google': '#4285F4',
    'Microsoft': '#7FBA00',
    'Apple': '#A3AAAE',
    'Amazon': '#FF9900',
    'Meta': '#1877F2',
    'Netflix': '#E50914',
    'default': '#FF6B6B'
  };

  useEffect(() => {
    const filtered = users.filter(user => {
      const skillMatch = selectedSkill === '' || user.skills.includes(selectedSkill);
      const companyMatch = selectedCompany === '' || user.company === selectedCompany;
      return skillMatch && companyMatch;
    });

    const formatted: GlobePoint[] = filtered.map(user => ({
      lat: user.lat,
      lng: user.lon,
      size:0.05, 
      color: companyColors[user.company] || companyColors['default'],
      name: user.name,
      title: user.title,
      company: user.company,
      skills: user.skills
    }));

    setPoints(formatted);
    setSelectedPoint(null); // Reset selection when filters change
  }, [users, selectedSkill, selectedCompany]);

  // Custom HTML for tooltip
  const getTooltip = (point: object) => {
    const globePoint = point as GlobePoint;
    return `
      <div class="globe-tooltip bg-gray-900 text-white p-4 rounded-lg border border-gray-700 shadow-xl max-w-xs">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-3 h-3 rounded-full" style="background: ${globePoint.color};"></div>
          <h3 class="font-bold text-lg">${globePoint.name}</h3>
        </div>
        <p class="text-gray-300 mb-1">${globePoint.title}</p>
        <p class="text-gray-400 mb-2">${globePoint.company}</p>
        <div class="flex flex-wrap gap-1">
          ${globePoint.skills.map(skill => `
            <span class="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-200">
              ${skill}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  };

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
      {/* Loading overlay */}
      <AnimatePresence>
        {!globeReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gray-900 z-10 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-transparent border-purple-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Globe visualization */}
      <Globe
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.5}
        pointResolution={16}
        pointLabel={getTooltip}
        onPointClick={point => setSelectedPoint(point as GlobePoint)}
        onPointHover={point => setHoveredPoint(point as GlobePoint)}
        pointsTransitionDuration={1000}
        onGlobeReady={() => setGlobeReady(true)}
        rendererConfig={{ antialias: true }}
        animateIn={false}
      />

      {/* Selected point details panel */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-4 top-4 bg-gray-900/90 backdrop-blur-sm rounded-xl p-4 w-64 border border-gray-700 shadow-lg z-10"
          >
            <div className="flex items-start gap-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full mt-1 flex-shrink-0" 
                style={{ background: selectedPoint.color }}
              />
              <div>
                <h3 className="font-bold text-lg">{selectedPoint.name}</h3>
                <p className="text-sm text-gray-300">{selectedPoint.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm mb-3">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-gray-400">{selectedPoint.company}</span>
            </div>

            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">SKILLS</h4>
              <div className="flex flex-wrap gap-1">
                {selectedPoint.skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-200"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-xs flex items-center gap-1 text-gray-400 hover:text-gray-200"
            >
              Close <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute left-4 bottom-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-lg z-10"
      >
        <h4 className="text-xs font-semibold text-gray-400 mb-2">COMPANY LEGEND</h4>
        <div className="space-y-2">
          {Object.entries(companyColors).map(([company, color]) => (
            <div key={company} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="text-xs text-gray-300">{company}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}