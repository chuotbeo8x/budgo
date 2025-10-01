'use client';

import { useBreakpoint } from './useBreakpoint';
import { responsiveSpacing, responsive } from '@/lib/design-system';

/**
 * Hook to get responsive values based on current breakpoint
 * Usage:
 * const { getSpacing, getTypography, getLayout } = useResponsive();
 * const padding = getSpacing('container'); // Returns responsive padding
 */
export function useResponsive() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const getSpacing = (key: 'container' | 'section' | 'element'): string => {
    if (isMobile) return responsiveSpacing.mobile[key];
    if (isTablet) return responsiveSpacing.tablet[key];
    return responsiveSpacing.desktop[key];
  };

  const getTypography = (element: 'h1' | 'h2' | 'h3' | 'body'): string => {
    if (isMobile) return responsive.typographyScale.mobile[element];
    if (isTablet) return responsive.typographyScale.tablet[element];
    return responsive.typographyScale.desktop[element];
  };

  const getLayout = () => {
    if (isMobile) return responsive.layout.mobile;
    if (isTablet) return responsive.layout.tablet;
    return responsive.layout.desktop;
  };

  const getInteraction = () => {
    if (isMobile) return responsive.interactions.mobile;
    return responsive.interactions.desktop;
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    getSpacing,
    getTypography,
    getLayout,
    getInteraction,
  };
}

