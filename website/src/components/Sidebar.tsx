"use client"
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Briefcase, Network, LogOut, ListChecks, LucideBadgeEuro } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IconCertificate } from '@tabler/icons-react';


export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('profile');
  const pathname = usePathname();
  const router = useRouter()
  const menuItems = [
    { id: 'profile', icon: User, label: 'dashboard' },
    { id: 'Skill Assessment', icon: Search, label: 'dashboard/skill_assessment' },
    { id: 'jobs', icon: Briefcase, label: 'dashboard/jobs' },
    { id: 'Resume&Interview tips', icon: ListChecks , label: 'dashboard/resume_and_interview_tips' },
    { id: 'network', icon: Network, label: 'dashboard/network' },
    { id: 'certificates', icon: IconCertificate, label: 'dashboard/certificates' },
    { id: 'leaderboard', icon:  LucideBadgeEuro, label: 'dashboard/leaderboard' },
  ];

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    console.log(pathSegments, " segs")
    if(lastSegment == 'dashboard'){
      setActiveItem('profile')
    }else
      setActiveItem(lastSegment);
  }, [pathname]);

  return (
    <motion.div
      className="min-h-full z-90 bg-gray-800 text-gray-100 flex flex-col shadow-lg"
      animate={{
        width: isExpanded ? '240px' : '72px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="p-4 flex items-center justify-between">
        {isExpanded && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
          >
            Elevance

          </motion.h1>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full p-2 hover:bg-gray-700"
        >
          {isExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-6 flex flex-col flex-1">
        {menuItems.map((item) => (
          <Link 
            key={item.id}
            href={`/${item.label}`}
            className={`flex items-center px-4 py-3 ${
              activeItem === item.id 
                ? 'bg-gradient-to-r from-indigo-800 to-purple-800 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            } transition-colors`}
          >
            <item.icon size={20} className={activeItem === item.id ? 'text-purple-300' : ''} />
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                {item.id}
              </motion.span>
            )}
          </Link>
        ))}
      </div>

      <motion.button
        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 mt-auto mb-6"
        whileTap={{ scale: 0.97 }}
      >
        <LogOut size={20} />
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ml-3"
          >
            Logout
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
}