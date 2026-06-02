'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 1.4, 
      ease: [0.16, 1, 0.3, 1] as const
    } 
  }
};

export default function About() {
  return (
    <main className="w-screen h-screen h-dvh flex flex-col items-center justify-center bg-[#EFF2ED] text-[#111111] px-6 md:px-12 select-none overflow-hidden">
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={fadeUp} 
        className="max-w-xl text-center flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-8 italic tracking-tight text-[#111111]">
          about the studio
        </h1>
        <p className="text-[12px] md:text-xs font-sans tracking-widest leading-loose text-[#111111]/70 uppercase font-medium max-w-lg">
          Permia is an independent creative studio specializing in editorial and fine art photography. 
          We believe that beauty is found in the unforced and the authentic. Our process relies heavily on natural light, an analog aesthetic, and the raw connection between subjects.
        </p>
        <div className="w-12 h-[1px] bg-[#111111]/25 mt-10" />
      </motion.div>
    </main>
  );
}