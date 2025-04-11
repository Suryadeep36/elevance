"use client"
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ElevanceLoader = ({ onComplete }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFinalText, setShowFinalText] = useState(false);

  useEffect(() => {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700;900&family=Orbitron:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Loader timeout
    const loaderTimeout = setTimeout(() => {
      setIsLoading(false);
      setShowFinalText(true);
      setTimeout(() => onComplete?.(), 2000);
    }, 2500);

    return () => {
      clearTimeout(loaderTimeout);
      document.head.removeChild(fontLink);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[9999] overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => {
          const size = Math.random() * 3 + 1;
          const opacity = Math.random() * 0.8 + 0.2;
          return (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: opacity,
              }}
              animate={{
                opacity: [opacity * 0.3, opacity, opacity * 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          );
        })}
      </div>

      {/* Central Loading Sphere */}
      <motion.div 
        className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center"
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: isLoading ? [0.9, 1.1, 0.9] : 1.5,
          opacity: isLoading ? 1 : 0.8,
        }}
        transition={{
          duration: isLoading ? 4 : 1.5,
          repeat: isLoading ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Pulsing Core */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.8) 0%, rgba(139,92,246,0.6) 50%, transparent 70%)',
            boxShadow: '0 0 80px rgba(236,72,153,0.6), 0 0 160px rgba(139,92,246,0.4)',
          }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Rotating Rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full border"
              style={{
                borderColor: i % 2 === 0 ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                borderWidth: '1px',
                top: `${i * 15}%`,
                left: `${i * 15}%`,
                right: `${i * 15}%`,
                bottom: `${i * 15}%`,
              }}
              animate={{
                rotate: i % 2 === 0 ? 360 : -360,
              }}
              transition={{
                duration: 12 - i * 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Final Text Reveal */}
      <AnimatePresence>
        {showFinalText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 text-center"
          >
            <motion.h2
              className="text-5xl md:text-7xl font-bold"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                background: 'linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
              initial={{ letterSpacing: '1em', opacity: 0 }}
              animate={{ 
                letterSpacing: '0.1em',
                opacity: 1,
              }}
              transition={{ 
                duration: 1.2, 
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              ELEVANCE
            </motion.h2>
            
            <motion.div
              className="w-1/2 h-px mx-auto"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.8), rgba(139,92,246,0.8), transparent)'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "circOut" }}
            />
            <motion.p
                className="text-lg uppercase tracking-wider mt-6"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 400,
                  color: '#bfdbfe',
                  letterSpacing: '0.3em',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
               Elevate your skills. Advance your career.
              </motion.p>
          </motion.div>
          
        )}
      </AnimatePresence>

      {/* Final Burst Effect */}
      {showFinalText && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)'
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 3, opacity: [0, 0.4, 0] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
    </div>
  );
};

export default ElevanceLoader;