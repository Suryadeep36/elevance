"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Briefcase, Search, Compass, Map, Settings, LogOut, ChevronLeft, ChevronRight, Home, BarChart3, Sparkles } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Profile', href: '/dashboard', icon: User },
    { name: 'Skill Assessment', href: '/dashboard/skill_assessment', icon: Compass },
    { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Network', href: '/dashboard/network', icon: Map },
    { name: 'Certificates', href: '/dashboard/certificates', icon: BarChart3 },
    { name: 'Course', href: '/dashboard/course', icon: Search },
    { name: 'Resume and Interview', href: '/dashboard/resume_and_interview', icon: Home },  
  ];

  // Animations
  const sidebarVariants = {
    expanded: { width: '240px', transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { width: '80px', transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  const childrenVariants = {
    expanded: { marginLeft: '240px', transition: { duration: 0.3, ease: 'easeInOut' } },
    collapsed: { marginLeft: '80px', transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-950 text-white mt-10">
      {/* Sidebar */}
      <motion.div 
        className="mt-20 fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 z-10 shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-80"
        initial="expanded"
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">TalentSync</span>
              </motion.div>
            )}

            <motion.button
              onClick={() => setCollapsed(!collapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;

                return (
                  <Link key={item.href} href={item.href} passHref>
                    <motion.div
                      className={`flex items-center p-3 rounded-xl cursor-pointer transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/20' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}
                      whileHover={!isActive ? { x: 4 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconComponent size={20} className={isActive ? "text-white" : "text-gray-400"} />
                      
                      {!collapsed && (
                        <motion.span 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="ml-3 whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}

                      {isActive && !collapsed && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content area */}
      <motion.main 
        className="flex-1 transition-all"
        initial="expanded"
        animate={collapsed ? 'collapsed' : 'expanded'}
        variants={childrenVariants}
      >
        <div className="p-6 pt-8 max-w-screen-2xl mx-auto">
          {mounted && children}
        </div>
      </motion.main>
    </div>
  );
};

export default Layout;