'use client';

import { useState, useEffect } from 'react';
import { breakpoints } from '@/lib/design-system';

type Breakpoint = 'mobile' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Hook to detect current breakpoint
 * Usage: 
 * const { isMobile, isTablet, isDesktop, current } = useBreakpoint();
 */
export function useBreakpoint() {
  const [current, setCurrent] = useState<Breakpoint>('mobile');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;
      
      if (width >= parseInt(breakpoints['2xl'])) return '2xl';
      if (width >= parseInt(breakpoints.xl)) return 'xl';
      if (width >= parseInt(breakpoints.lg)) return 'lg';
      if (width >= parseInt(breakpoints.md)) return 'md';
      if (width >= parseInt(breakpoints.sm)) return 'sm';
      return 'mobile';
    };

    const handleResize = () => {
      setCurrent(getBreakpoint());
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return {
      current: 'mobile' as Breakpoint,
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isSmAndUp: false,
      isMdAndUp: false,
      isLgAndUp: false,
      isXlAndUp: false,
    };
  }

  return {
    current,
    isMobile: current === 'mobile',
    isTablet: current === 'sm' || current === 'md',
    isDesktop: current === 'lg' || current === 'xl' || current === '2xl',
    isSmAndUp: ['sm', 'md', 'lg', 'xl', '2xl'].includes(current),
    isMdAndUp: ['md', 'lg', 'xl', '2xl'].includes(current),
    isLgAndUp: ['lg', 'xl', '2xl'].includes(current),
    isXlAndUp: ['xl', '2xl'].includes(current),
  };
}

/**
 * Hook to check if viewport matches a specific breakpoint
 * Usage: const isMobile = useMediaQuery('(max-width: 767px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    
    const updateMatch = () => {
      setMatches(media.matches);
    };

    updateMatch();
    
    // Use newer API if available
    if (media.addEventListener) {
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    } else {
      // Fallback for older browsers
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);

  // Prevent hydration mismatch
  if (!mounted) {
    return false;
  }

  return matches;
}

