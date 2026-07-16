'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import LiquidDistortionCanvas from '@/components/LiquidDistortionCanvas';

const pageVariants = {
  hidden: { y: '100vh' },
  visible: { 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.55, 0.055, 0.675, 0.19], // easeIn: initially slow, then fast
      when: "beforeChildren"
    } 
  }
};

const textFadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      delay: 0.2 // small stagger after the page starts sliding in
    } 
  }
};

export default function About() {
  return (
    <motion.main 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 w-screen h-screen h-dvh flex flex-col items-center justify-center bg-[#060606] text-white px-6 md:px-12 select-none overflow-hidden z-30"
    >
      {/* Background Liquid Distortion */}
      <div className="absolute inset-0 z-0 opacity-60">
        <LiquidDistortionCanvas 
          src="/images/sand_dunes.png" // arbitrary image to distort into black liquid
          isHovered={true} // keep it swirling
          isDark={true}    // completely blackbars style
          isRevealed={false} 
          isVisible={true}
        />
      </div>

      {/* Foreground Content */}
      <motion.div 
        variants={textFadeUp} 
        className="relative z-10 max-w-xl text-center flex flex-col items-center pointer-events-none"
      >
        <h2 className="text-[10px] md:text-xs font-mono tracking-[0.3em] text-white/50 mb-6 uppercase">
          ABOUT //
        </h2>
        <p className="text-[12px] md:text-xs font-sans tracking-widest leading-loose text-white/90 uppercase font-medium max-w-lg">
          Permia is an independent creative studio specializing in editorial and fine art photography. 
          We believe that beauty is found in the unforced and the authentic. Our process relies heavily on natural light, an analog aesthetic, and the raw connection between subjects.
        </p>
      </motion.div>
    </motion.main>
  );
}