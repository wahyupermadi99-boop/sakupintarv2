import React from 'react';
import { motion } from 'motion/react';

interface SakuPintarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SakuPintarLogo: React.FC<SakuPintarLogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <motion.div
      className={`relative justify-center items-center flex ${dimensions[size]} ${className}`}
      animate={{ 
        y: [0, -3, 0],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Outer ambient blur shadow for neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-orange-400 rounded-2xl blur-md opacity-45 animate-pulse" />

      {/* Glassmorphic border container */}
      <div className="absolute inset-0 bg-slate-950/75 border border-white/20 rounded-2xl backdrop-blur-xl flex items-center justify-center p-1.5 shadow-md shadow-cyan-500/10">
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="sakuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
              <stop offset="50%" stopColor="#d946ef" /> {/* Fuchsia */}
              <stop offset="100%" stopColor="#ff7849" /> {/* Orange */}
            </linearGradient>
            
            <linearGradient id="innerSpark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Saku (The Pocket / Wallet Shield base) */}
          <path 
            d="M20 25 C20 18, 80 18, 80 25 V55 C80 72, 50 88, 50 88 C50 88, 20 72, 20 55 V25 Z" 
            fill="url(#sakuGrad)" 
            fillOpacity="0.15"
            stroke="url(#sakuGrad)" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Saku flap boundary line */}
          <path 
            d="M23 35 Q50 48 77 35" 
            stroke="url(#sakuGrad)" 
            strokeWidth="4" 
            strokeLinecap="round" 
            opacity="0.8"
          />

          {/* Pintar (Dynamic Intelligent Spark / 4-Point Star in the center) */}
          <path 
            d="M50 32 L54 44 L66 48 L54 52 L50 64 L46 52 L34 48 L46 44 Z" 
            fill="url(#innerSpark)" 
            className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          />

          {/* Micro dots representing AI data nodes / Gen Z technology aspect */}
          <circle cx="50" cy="18" r="3" fill="#22d3ee" />
          <circle cx="15" cy="50" r="2.5" fill="#d946ef" />
          <circle cx="85" cy="50" r="2.5" fill="#ff7849" />
        </svg>
      </div>
    </motion.div>
  );
};
