"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TechLoaderProps {
  onLoadingComplete?: () => void;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  loadingTime?: number;
}

export function TechLoader({
  onLoadingComplete,
  text = "Initializing Elevance",
  fullScreen = true,
  className,
  loadingTime = 3000
}: TechLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showFinalAnimation, setShowFinalAnimation] = useState(false);
  
  useEffect(() => {
    // Simulate loading progress
    let startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(Math.floor((elapsed / loadingTime) * 100), 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(intervalId);
        setShowFinalAnimation(true);
        setTimeout(() => {
          setIsComplete(true);
          onLoadingComplete?.();
        }, 1000);
      }
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [loadingTime, onLoadingComplete]);
  
  if (isComplete) return null;

  return (
    <div className={cn(
      "fixed inset-0 flex items-center justify-center",
      fullScreen ? "z-50 bg-gray-900" : "",
      className
    )}>
      <div className="max-w-md w-full px-4">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full">
            {/* Generate tech grid pattern */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`h-line-${i}`} 
                className="absolute h-px bg-blue-500/20" 
                style={{ 
                  left: 0, 
                  right: 0,
                  top: `${i * 5}%`,
                  opacity: i % 2 === 0 ? 0.1 : 0.05
                }}
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`v-line-${i}`} 
                className="absolute w-px bg-blue-500/20" 
                style={{ 
                  top: 0, 
                  bottom: 0,
                  left: `${i * 5}%`,
                  opacity: i % 2 === 0 ? 0.1 : 0.05
                }}
              />
            ))}
            
            {/* Animated particles */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 rounded-full bg-blue-400"
                initial={{ 
                  x: Math.random() * 100 + "vw", 
                  y: Math.random() * 100 + "vh", 
                  opacity: 0 
                }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2 + Math.random() * 3,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative z-10">
          {/* Logo & brand */}
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 shadow-lg shadow-blue-500/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl">
                  E
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Loading resources...</span>
              <motion.span
                key={progress}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {progress}%
              </motion.span>
            </div>
          </div>
          
          {/* Loading message */}
          <motion.div 
            className="text-center mb-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop"
            }}
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium">
              {text}
            </span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="inline-block"
            >
              <span className="text-blue-400 ml-1">.</span>
              <span className="text-blue-400">.</span>
              <span className="text-blue-400">.</span>
            </motion.span>
          </motion.div>
          
          {/* Final animation */}
          <AnimatePresence>
            {showFinalAnimation && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="rounded-full bg-blue-500"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 20, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Loading facts/tips */}
          <AnimatePresence mode="wait">
            <motion.div
              key={Math.floor(progress / 20)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-center text-xs text-gray-500"
            >
              {loadingMessages[Math.floor(progress / 20) % loadingMessages.length]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const loadingMessages = [
  "Connecting to Elevance knowledge network...",
  "Preparing interactive 3D visualizations...",
  "Loading career development tools...",
  "Analyzing market trends and opportunities...",
  "Calibrating skill assessment modules...",
  "Initializing immersive learning experience..."
];
