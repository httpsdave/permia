'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidDistortionCanvas from '@/components/LiquidDistortionCanvas';

const FlipText = ({ children }: { children: React.ReactNode }) => (
  <div className="relative overflow-hidden inline-flex flex-col">
    <span className="block group-hover:-translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
      {children}
    </span>
    <span className="absolute top-0 left-0 block translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" aria-hidden="true">
      {children}
    </span>
  </div>
);

export function Header() {
  const pathname = usePathname();
  const [timeData, setTimeData] = React.useState({
    timeStr: '--:-- --',
    hoursStr: '--',
    minutesStr: '--',
    secondsStr: '--',
    ampm: '--'
  });
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isClockOpen, setIsClockOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const getPHTTime = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const pht = new Date(utc + (3600000 * 8));
      
      let hours = pht.getHours();
      const minutes = pht.getMinutes();
      const seconds = pht.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const hoursStr = hours < 10 ? '0' + hours : hours.toString();
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const secondsStr = seconds < 10 ? '0' + seconds : seconds;
      
      return {
        timeStr: `${hours}:${minutesStr}${ampm}`,
        hoursStr: hoursStr,
        minutesStr: minutesStr.toString(),
        secondsStr: secondsStr.toString(),
        ampm
      };
    };

    setTimeData(getPHTTime());
    const interval = setInterval(() => {
      setTimeData(getPHTTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isDarkTheme = pathname === '/about' || isOpen || isClockOpen;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center transition-colors duration-300 ${isDarkTheme ? 'text-white' : 'text-[#111111]'} bg-transparent pointer-events-none`}>
        {/* Logo */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className="text-base font-sans font-bold tracking-widest uppercase pointer-events-auto group"
        >
          <FlipText>permia</FlipText>
        </Link>

        {/* Clock */}
        <div 
          onClick={() => { setIsClockOpen(!isClockOpen); setIsOpen(false); }}
          className={`hidden lg:block absolute left-[26%] lg:left-[28%] transform -translate-x-1/2 text-xs font-sans tracking-widest font-bold ${isDarkTheme ? 'text-white/45' : 'text-[#111111]/45'} transition-colors duration-300 pointer-events-auto cursor-pointer group`}
        >
          <FlipText>{isClockOpen ? 'CLOSE' : (mounted ? timeData.timeStr : '--:-- --')}</FlipText>
        </div>

        {/* Location */}
        <div className={`hidden lg:block absolute left-1/2 transform -translate-x-1/2 text-xs font-sans tracking-widest font-bold ${isDarkTheme ? 'text-white/45' : 'text-[#111111]/45'} transition-colors duration-300 uppercase pointer-events-auto cursor-pointer group`}>
          <FlipText>PHILIPPINES</FlipText>
        </div>

        {/* Desktop Nav links */}
        <nav className="hidden lg:flex space-x-6 md:space-x-8 items-center text-xs font-sans tracking-widest uppercase font-bold pointer-events-auto">
          <Link 
            href="/" 
            className={`group transition-all duration-300 ${
              pathname === '/' 
                ? (isDarkTheme ? 'text-white/45 pointer-events-none' : 'text-[#111111]/45 pointer-events-none')
                : (isDarkTheme ? 'text-white' : 'text-[#111111]')
            }`}
          >
            <FlipText>Work</FlipText>
          </Link>
          <Link 
            href="/about" 
            className={`group transition-all duration-300 ${
              pathname === '/about' 
                ? (isDarkTheme ? 'text-white/45 pointer-events-none' : 'text-[#111111]/45 pointer-events-none')
                : (isDarkTheme ? 'text-white' : 'text-[#111111]')
            }`}
          >
            <FlipText>About</FlipText>
          </Link>
        </nav>

        {/* Mobile / Tablet Hamburger */}
        <div className="flex lg:hidden pointer-events-auto">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-2.5 relative focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Toggle Menu"
          >
            <motion.span 
              className={`absolute w-full h-[2px] ${isDarkTheme ? 'bg-white' : 'bg-[#111111]'} transition-colors duration-300`}
              initial={false}
              animate={isOpen ? { top: '50%', y: '-50%' } : { top: '0%', y: '0%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <motion.span 
              className={`absolute w-full h-[2px] ${isDarkTheme ? 'bg-white' : 'bg-[#111111]'} transition-colors duration-300`}
              initial={false}
              animate={isOpen ? { bottom: '50%', y: '50%' } : { bottom: '0%', y: '0%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </button>
        </div>
      </header>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { y: '-100%' },
              visible: { 
                y: 0, 
                transition: { 
                  duration: 0.4, 
                  ease: [0.22, 1, 0.36, 1], 
                  staggerChildren: 0.1, 
                  delayChildren: 0.35 
                } 
              },
              exit: { 
                y: '-100%', 
                transition: { 
                  duration: 0.7, 
                  ease: [0.55, 0.055, 0.675, 0.19] 
                } 
              }
            }}
            className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center"
          >
            <nav className="flex flex-col items-center space-y-6 text-white text-[2rem] md:text-5xl font-sans font-medium tracking-tight">
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  exit: { opacity: 0, transition: { duration: 0.2 } }
                }}
              >
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)} 
                  className={`block group transition-opacity duration-300 ${pathname === '/' ? 'text-white/45 pointer-events-none' : 'text-white'}`}
                >
                  <FlipText>Work</FlipText>
                </Link>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
                  exit: { opacity: 0, transition: { duration: 0.2 } }
                }}
              >
                <Link 
                  href="/about" 
                  onClick={() => setIsOpen(false)} 
                  className={`block group transition-opacity duration-300 ${pathname === '/about' ? 'text-white/45 pointer-events-none' : 'text-white'}`}
                >
                  <FlipText>About</FlipText>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Clock Overlay */}
      <AnimatePresence>
        {isClockOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { y: '100%' },
              visible: { 
                y: 0, 
                transition: { 
                  duration: 0.7, 
                  ease: [0.22, 1, 0.36, 1], 
                  staggerChildren: 0.15, 
                  delayChildren: 0.4 
                } 
              },
              exit: { 
                y: '100%', 
                transition: { 
                  duration: 0.7, 
                  ease: [0.55, 0.055, 0.675, 0.19] 
                } 
              }
            }}
            className="fixed inset-0 bg-[#060606] z-40 flex flex-col items-center justify-center overflow-hidden select-none text-white"
          >
            {/* Background Liquid Distortion */}
            <div className="absolute inset-0 z-0 opacity-60">
              <LiquidDistortionCanvas 
                src="/images/sand_dunes.png" 
                isHovered={true} 
                isDark={true}    
                isRevealed={false} 
                isVisible={true}
              />
            </div>

            {/* Time Content */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none px-6 md:px-12 mt-[24vh]">
              
              {/* Horizontal Meta Info Overlay */}
              <div className="w-full z-30 pointer-events-none mb-1 md:mb-2 translate-y-[6vh] md:translate-y-[10vh]">
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: -60 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    exit: { opacity: 0, transition: { duration: 0.2 } }
                  }}
                  className="flex items-center w-full font-mono"
                >
                {/* Seconds - Left */}
                <div className="flex-1 text-[15px] md:text-[17px]">
                  <span className="uppercase font-bold tracking-widest">{mounted ? timeData.secondsStr : '--'}</span>
                </div>
                {/* AM/PM - Center */}
                <div className="flex-1 flex justify-center text-[15px] md:text-[17px]">
                  <span className="uppercase font-bold tracking-widest">{mounted ? timeData.ampm : '--'}</span>
                </div>
                {/* Text - Right */}
                <div className="flex-1 flex justify-end text-[16px] md:text-[18px]">
                  <span className="normal-case tracking-normal font-medium -translate-x-[80px] md:-translate-x-[120px]">Might be a good time to reach out</span>
                </div>
                </motion.div>
              </div>

              {/* Huge Time */}
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: -60 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                  exit: { opacity: 0, transition: { duration: 0.2 } }
                }}
                className="flex items-center justify-center gap-[6vw] md:gap-[10vw] w-full font-sans text-[38vw] md:text-[35vw] leading-none tracking-tighter z-20"
              >
                <span>{mounted ? timeData.hoursStr : '--'}</span>
                
                {/* Square Colon */}
                <div className="flex flex-col gap-[5vw] md:gap-[4vw]">
                  <div className="w-[3.5vw] h-[3.5vw] md:w-[2.5vw] md:h-[2.5vw] bg-white"></div>
                  <div className="w-[3.5vw] h-[3.5vw] md:w-[2.5vw] md:h-[2.5vw] bg-white"></div>
                </div>
                
                <span>{mounted ? timeData.minutesStr : '--'}</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}