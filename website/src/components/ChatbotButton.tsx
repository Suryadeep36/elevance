'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ChatbotButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 cursor-pointer">
      {isHovered && (
        <div 
          className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 shadow-lg mb-2 whitespace-nowrap animate-fade-in"
          style={{ 
            animation: 'fadeIn 0.3s ease-in-out', 
            transformOrigin: 'bottom right' 
          }}
        >
          Elevance Assistance
        </div>
      )}
      <Link href="/chatbot">
        <button
          className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center w-14 h-14"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Chat with Elevance Assistant"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </Link>
    </div>
  );
}
