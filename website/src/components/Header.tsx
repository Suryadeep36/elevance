'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

function Header() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClass = isScrolled
    ? 'py-3 bg-[#0a1120]/95 backdrop-blur-md shadow-lg border-b border-blue-900/50'
    : 'py-5 bg-[#0a1120]/80 backdrop-blur-sm';

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link href="/" className="relative z-10 pl-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                E
              </div>
              <span className="font-bold text-lg md:text-xl text-white">Elevance</span>
            </motion.div>
          </Link>

          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            <Link
              href="/"
              className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a1120] rounded px-2 py-1 ${
                isActivePath('/')
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-200 hover:text-blue-400'
              }`}
            >
              Home
            </Link>

            {isSignedIn && (
              <>
                <Link
                  href="/dashboard"
                  className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a1120] rounded px-2 py-1 ${
                    isActivePath('/dashboard')
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-200 hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/leaderboard"
                  className={`font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a1120] rounded px-2 py-1 ${
                    isActivePath('/leaderboard')
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-200 hover:text-blue-400'
                  }`}
                >
                  Leaderboard
                </Link>
              </>
            )}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex items-center gap-4"
          >
            {isLoaded && (
              isSignedIn ? (
                <div className="flex items-center gap-4">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-9 w-9 border-2 border-blue-800 hover:border-blue-400",
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/sign-in" className="bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md text-sm px-4 py-2 transition-colors">
                    Sign in
                  </Link>
                </div>
              )
            )}
          </motion.div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md"
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0a1120] shadow-lg border-t border-blue-900/50"
          >
            <div className="container-custom py-4 pr-10">
              <nav className="flex flex-col gap-4 mb-6">
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isActivePath('/')
                      ? 'bg-blue-900/50 text-blue-300'
                      : 'text-gray-200 hover:bg-blue-900/30'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                {isSignedIn && (
                  <>
                    <Link
                      href="/dashboard"
                      className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isActivePath('/dashboard')
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'text-gray-200 hover:bg-blue-900/30'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/leaderboard"
                      className={`px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isActivePath('/leaderboard')
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'text-gray-200 hover:bg-blue-900/30'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Leaderboard
                    </Link>
                  </>
                )}
              </nav>

              {isLoaded && (
                isSignedIn ? (
                  <div className="flex items-center justify-between px-4">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="px-4">
                    <Link
                      href="/sign-in"
                      className="bg-blue-700 hover:bg-blue-600 text-white w-full text-center font-medium rounded-md text-sm py-2.5 block transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;