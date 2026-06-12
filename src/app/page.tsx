'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface GalleryItem {
  id: number;
  title: string;
  subtitle?: string;
  category: string;
  date: string;
  src: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: "Justdiggit | Our world", category: "Motion, Development", date: "2024 — Taken on Oct 12", src: "/images/farmer_digging.png" },
  { id: 2, title: "Laser | Sony Music", category: "Motion, Development", date: "2024", src: "/images/portrait_curly.png" },
  { id: 3, title: "Golden Brotherhood", subtitle: "Inner Warmth", category: "Documentary, Human", date: "2023 — Taken on Jul 05", src: "/images/kids_hugging.png" },
  { id: 4, title: "Whispering Dunes", subtitle: "Sands of Time", category: "Minimalist, Landscape", date: "2024 — Taken on Nov 30", src: "/images/sand_dunes.png" },
  { id: 5, title: "Harvest Hands", subtitle: "Earth's Gift", category: "Organic, Editorial", date: "2026 — Taken on Apr 15", src: "/images/hands_grains.png" },
  
  // 17 Placeholder items repeating the premium assets with custom categories/dates for a 22-image portfolio
  { id: 6, title: "Jimmy Nelson", subtitle: "Core Studio", category: "Motion, Development", date: "2022", src: "/images/farmer_digging.png" },
  { id: 7, title: "Silent Monolith", subtitle: "Shadow Play", category: "Abstract, Structure", date: "2021 — Taken on Oct 08", src: "/images/sand_dunes.png" },
  { id: 8, title: "Anima", subtitle: "Inner Landscapes", category: "Fine Art, Portrait", date: "2023 — Taken on May 12", src: "/images/portrait_curly.png" },
  { id: 9, title: "Solitude & Whispers", category: "Analog, Black & White", date: "2024 — Taken on Jan 22", src: "/images/portrait_curly.png" },
  { id: 10, title: "Tethered Dreams", category: "Documentary, Editorial", date: "2025 — Taken on Sep 14", src: "/images/kids_hugging.png" },
  { id: 11, title: "Arid Resonance", category: "Minimalist, Space", date: "2024 — Taken on Aug 04", src: "/images/sand_dunes.png" },
  { id: 12, title: "Organic Touch", category: "Tactile, Raw", date: "2026 — Taken on Mar 09", src: "/images/hands_grains.png" },
  { id: 13, title: "Sunken Gazes", category: "Editorial, Film", date: "2023 — Taken on Nov 11", src: "/images/portrait_curly.png" },
  { id: 14, title: "Dust & Glory", category: "Motion, Development", date: "2024 — Taken on Jun 30", src: "/images/farmer_digging.png" },
  { id: 15, title: "Sibling Reverie", category: "Human, Fine Art", date: "2023 — Taken on Dec 18", src: "/images/kids_hugging.png" },
  { id: 16, title: "Desert Drift", category: "Minimalist, Landscape", date: "2024 — Taken on Feb 14", src: "/images/sand_dunes.png" },
  { id: 17, title: "Cradle of Wheat", category: "Organic, Portrait", date: "2026 — Taken on Jan 05", src: "/images/hands_grains.png" },
  { id: 18, title: "Static Waves", category: "Abstract, Motion", date: "2022 — Taken on Sep 27", src: "/images/farmer_digging.png" },
  { id: 19, title: "Echoes of Silence", category: "Analog, Film", date: "2025 — Taken on Jul 19", src: "/images/portrait_curly.png" },
  { id: 20, title: "Tangled Bonds", category: "Documentary, Mood", date: "2023 — Taken on Oct 31", src: "/images/kids_hugging.png" },
  { id: 21, title: "Shifted Horizon", category: "Landscape, Form", date: "2024 — Taken on Dec 15", src: "/images/sand_dunes.png" },
  { id: 22, title: "Grains of Clarity", category: "Editorial, Fine Art", date: "2026 — Taken on May 24", src: "/images/hands_grains.png" }
];

export default function Home() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [layoutMode, setLayoutMode] = React.useState<1 | 2>(1); // 1 = Focused, 2 = Filmstrip
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  
  const lastScrollTime = React.useRef(0);
  const totalImages = galleryItems.length;

  // SVG displacement animation states
  const timeRef = React.useRef(0);
  const currentScale = React.useRef(2.0);
  const targetScale = React.useRef(2.0);
  
  const turbulenceRef = React.useRef<SVGFETurbulenceElement>(null);
  const displacementRef = React.useRef<SVGFEDisplacementMapElement>(null);

  React.useEffect(() => {
    let animationFrameId: number;

    const animateFilter = () => {
      timeRef.current += 0.8;
      
      // Interpolate displacement scale smoothly
      currentScale.current += (targetScale.current - currentScale.current) * 0.10;

      if (turbulenceRef.current) {
        // Continuous slow organic ripple wave frequency
        const freqX = 0.015 + Math.sin(timeRef.current * 0.010) * 0.002;
        const freqY = 0.02 + Math.cos(timeRef.current * 0.008) * 0.003;
        turbulenceRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      }

      if (displacementRef.current) {
        displacementRef.current.setAttribute('scale', currentScale.current.toFixed(2));
      }

      animationFrameId = requestAnimationFrame(animateFilter);
    };

    animationFrameId = requestAnimationFrame(animateFilter);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Snapped wheel/trackpad scrolling
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    
    // Reduce throttle time significantly for a more responsive feel, 
    // while still preventing rapid fire from trackpads.
    if (now - lastScrollTime.current < 250) return; 

    const threshold = 10;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

    if (Math.abs(delta) > threshold) {
      if (delta > 0) {
        // When scrolling down, we just increment. The infinite math handles the rest.
        setActiveIndex((prev) => prev + 1);
      } else {
        setActiveIndex((prev) => prev - 1);
      }
      lastScrollTime.current = now;
    }
  };



  // Hover displacement triggers and coordinates tracking
  const handleHoverStart = (idx: number) => {
    setHoveredIdx(idx);
    targetScale.current = 45.0; // High fluid distortion scale on hover
  };

  const handleHoverEnd = () => {
    setHoveredIdx(null);
    targetScale.current = 2.0; // Ambient subtle wave on hover out
  };

  // Tracks relative mouse location inside element to update SVG radial mask
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    
    const grad = document.getElementById('mouse-grad');
    if (grad) {
      grad.setAttribute('cx', `${mx}%`);
      grad.setAttribute('cy', `${my}%`);
    }
  };

  // Dynamic dimensions for calculation
  const gapVal = layoutMode === 1 ? 1.8 : 2.0; 
  const activeVal = layoutMode === 1 ? 46 : 26; 
  const collapsedVal = layoutMode === 1 ? 8.5 : 26; 
  
  // Calculate relative offset in vw from the center
  const getOffsetVw = (relIdx: number) => {
    if (relIdx === 0) return 0;
    const sign = relIdx > 0 ? 1 : -1;
    return sign * ((activeVal / 2) + gapVal + (Math.abs(relIdx) - 1) * (collapsedVal + gapVal) + (collapsedVal / 2));
  };

  return (
    <main 
      className="relative w-screen h-screen h-dvh flex flex-col justify-between pt-28 pb-4 overflow-hidden bg-[#EFF2ED] select-none"
      onWheel={handleWheel}
    >
      {/* SVG definitions for Masked Cursor Turbulence Liquid Ripple */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          {/* Dynamic gradient whose center shifts to track cursor in real time */}
          <radialGradient id="mouse-grad" cx="50%" cy="50%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="1.0" />
            <stop offset="60%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </radialGradient>
          
          {/* A concrete rect graphic to act as the displacement mask source */}
          <rect id="mouse-mask-shape" width="100%" height="100%" fill="url(#mouse-grad)" />
          
          <filter id="liquid-marble-filter">
            <feTurbulence 
              ref={turbulenceRef}
              type="fractalNoise" 
              baseFrequency="0.015 0.02" 
              numOctaves="3" 
              result="noise" 
              seed="1"
            />
            
            {/* Load and multiply the turbulence noise by the cursor shape mask */}
            <feImage href="#mouse-mask-shape" result="mask" />
            <feComposite in="noise" in2="mask" operator="in" result="maskedNoise" />
            
            <feDisplacementMap 
              ref={displacementRef}
              in="SourceGraphic" 
              in2="maskedNoise" 
              scale="2.0" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Immersive Gallery Section */}
      <div className="flex-grow flex items-center relative w-full h-[66vh] md:h-[68vh] my-auto overflow-hidden">
        <div className="relative w-full flex items-center h-full">
          {/* Infinite sliding gallery using absolute positioning */}
          {galleryItems.map((item, idx) => {
            // Determine shortest path relative index for infinite loop
            const normalizedActive = ((activeIndex % totalImages) + totalImages) % totalImages;
            let relativeIdx = idx - normalizedActive;
            
            if (relativeIdx > totalImages / 2) relativeIdx -= totalImages;
            if (relativeIdx < -totalImages / 2) relativeIdx += totalImages;

            const isActive = relativeIdx === 0;
            const isHovered = hoveredIdx === idx;
            
            // Hide items far off-screen to prevent visible flying during wrap-around
            const isVisible = Math.abs(relativeIdx) <= 5;
            
            // Base opacity rules
            let targetOpacity = layoutMode === 1 ? 1.0 : (isActive ? 1.0 : 0.45);
            if (!isVisible) targetOpacity = 0;

            return (
              <motion.div
                key={`carousel-item-${item.id}`}
                className="absolute top-1/2 -translate-y-1/2 rounded-none overflow-hidden h-[460px] md:h-[530px] lg:h-[550px] flex-shrink-0 cursor-pointer group"
                initial={false}
                animate={{
                  left: "50%",
                  x: `calc(${getOffsetVw(relativeIdx)}vw - 50%)`,
                  width: layoutMode === 1 
                    ? (isActive ? "46vw" : "8.5vw") 
                    : "26vw",
                  minWidth: layoutMode === 1
                    ? (isActive ? "320px" : "80px")
                    : "220px",
                  maxWidth: layoutMode === 1
                    ? (isActive ? "880px" : "150px")
                    : "350px",
                  opacity: targetOpacity,
                  scale: layoutMode === 1 ? 1.0 : (isActive ? 1.0 : 0.95),
                }}
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 18,
                  // Disable transition if invisible to allow instant off-screen wrap
                  opacity: { duration: 0.2 }
                }}
                  onClick={() => {
                    if (activeIndex !== idx) {
                      setActiveIndex(idx);
                    }
                  }}
                  onMouseEnter={() => handleHoverStart(idx)}
                  onMouseLeave={handleHoverEnd}
                  onMouseMove={handleMouseMove}
                >
                  {/* Inner element scaled slightly up (1.07x) during hover warp */}
                  {/* This completely clips out any wobbly edges inside the straight parent container */}
                  <motion.div 
                    className="w-full h-full relative"
                    animate={{
                      scale: isHovered ? 1.07 : 1.01
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                      filter: isHovered ? 'url(#liquid-marble-filter)' : 'none',
                    }}
                  >
                    {/* Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>

                    {/* Dark Fluid Marble Overlay for Inactive Images (Layout 1) */}
                    <motion.div
                      className="absolute inset-0 bg-black pointer-events-none"
                      initial={false}
                      animate={{
                        opacity: (layoutMode === 1 && !isActive) ? 0.85 : 0
                      }}
                      transition={{ duration: 0.4 }}
                    />
                    
                    {layoutMode === 1 && !isActive && (
                      <motion.div
                        className="absolute inset-0 mix-blend-overlay opacity-80 pointer-events-none bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url('/images/liquid_marble.png')`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.90 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

      {/* Low-spacing Footer (Pushed tightly to the bottom) */}
      <footer className="w-full px-6 md:px-12 flex justify-between items-end bg-transparent pb-3 z-10">
        {/* Bottom Left: Title & Dates */}
        <div className="flex flex-col min-h-[70px] justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${((activeIndex % totalImages) + totalImages) % totalImages}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h2 className="text-base md:text-lg font-sans font-bold text-[#111111] leading-tight tracking-wide">
                {galleryItems[((activeIndex % totalImages) + totalImages) % totalImages].title}
              </h2>
              {galleryItems[((activeIndex % totalImages) + totalImages) % totalImages].subtitle && (
                <p className="text-xs md:text-sm font-sans font-semibold text-[#111111]/70 leading-snug mt-0.5">
                  {galleryItems[((activeIndex % totalImages) + totalImages) % totalImages].subtitle}
                </p>
              )}
              <p className="text-[10px] md:text-[11px] font-sans tracking-[0.2em] font-semibold text-[#111111]/45 mt-1 md:mt-2 uppercase">
                {galleryItems[((activeIndex % totalImages) + totalImages) % totalImages].date} &mdash; {galleryItems[((activeIndex % totalImages) + totalImages) % totalImages].category}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Right: Page Indicators & Layout Toggle */}
        <div className="flex items-center gap-24 md:gap-48 lg:gap-64 pb-1">
          {/* Numbers: current index (dim) and total count (bold) */}
          <div className="flex items-baseline gap-3 text-xs md:text-sm font-sans tracking-widest">
            <span className="text-[#111111]/35 font-semibold transition-opacity duration-300">
              {(((activeIndex % totalImages) + totalImages) % totalImages) + 1}
            </span>
            <span className="text-[#111111] font-bold">
              {totalImages}
            </span>
          </div>

          {/* Layout Toggle Button */}
          <button
            onClick={() => setLayoutMode((prev) => (prev === 1 ? 2 : 1))}
            className="flex items-center justify-center p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all duration-300 group cursor-pointer"
            aria-label="Toggle Layout Mode"
          >
            {layoutMode === 1 ? (
              /* ||| Icon (Spaced out layout toggle) */
              <svg 
                className="w-5 h-5 text-[#111111] opacity-75 group-hover:opacity-100 transition-opacity duration-300" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="square"
              >
                <line x1="6" y1="5" x2="6" y2="19" />
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="18" y1="5" x2="18" y2="19" />
              </svg>
            ) : (
              /* |||| Icon (Condensed layout toggle) */
              <svg 
                className="w-5 h-5 text-[#111111] opacity-75 group-hover:opacity-100 transition-opacity duration-300" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="square"
              >
                <line x1="5" y1="5" x2="5" y2="19" />
                <line x1="10" y1="5" x2="10" y2="19" />
                <line x1="15" y1="5" x2="15" y2="19" />
                <line x1="20" y1="5" x2="20" y2="19" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </main>
  );
}