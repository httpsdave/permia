'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = React.useState<string>('--:-- --');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const getPHTTime = () => {
      const d = new Date();
      // PHT is UTC+8. Calculate UTC time and then offset by 8 hours.
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const pht = new Date(utc + (3600000 * 8));
      
      let hours = pht.getHours();
      const minutes = pht.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // hours '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      
      return `${hours}:${minutesStr}${ampm}`;
    };

    // Initialize immediately
    setTimeStr(getPHTTime());

    // Update every second
    const interval = setInterval(() => {
      setTimeStr(getPHTTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center text-[#111111] bg-transparent">
      {/* Logo */}
      <Link href="/" className="text-base font-syne font-bold tracking-[0.3em] uppercase hover:opacity-75 transition-opacity">
        permia
      </Link>

      {/* Clock - Left-Center aligned (around 25% from left) */}
      <div className="hidden md:block absolute left-[26%] lg:left-[28%] transform -translate-x-1/2 text-xs font-syne tracking-[0.25em] font-bold text-[#111111]/45">
        {mounted ? timeStr : '--:-- --'}
      </div>

      {/* Location - Center aligned */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-xs font-syne tracking-[0.3em] font-bold text-[#111111]/45 uppercase">
        PHILIPPINES
      </div>

      {/* Nav links */}
      <nav className="flex space-x-6 md:space-x-8 items-center text-xs font-syne tracking-[0.25em] uppercase font-bold">
        <Link 
          href="/" 
          className={`transition-all duration-300 ${
            pathname === '/' 
              ? 'text-[#111111] font-bold' 
              : 'text-[#111111]/45 hover:text-[#111111]'
          }`}
        >
          Work
        </Link>
        <Link 
          href="/about" 
          className={`transition-all duration-300 ${
            pathname === '/about' 
              ? 'text-[#111111] font-bold' 
              : 'text-[#111111]/45 hover:text-[#111111]'
          }`}
        >
          About
        </Link>
      </nav>
    </header>
  );
}