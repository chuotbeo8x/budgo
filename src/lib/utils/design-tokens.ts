/**
 * Design Token Utilities
 * Helper functions to work with design system tokens
 */

import { 
  colors, 
  spacing, 
  typography, 
  borderRadius, 
  shadows,
  iconSizes,
  componentVariants,
  breakpoints,
  zIndex
} from '@/lib/design-system';

/**
 * Get color value from design system
 * @example getColor('primary.600') => '#2563eb'
 * @example getColor('success.500') => '#22c55e'
 */
export function getColor(path: string): string {
  const [group, shade] = path.split('.');
  const colorGroup = colors[group as keyof typeof colors];
  
  if (!colorGroup) return '';
  
  if (typeof colorGroup === 'string') {
    return colorGroup;
  }
  
  if (shade && typeof colorGroup === 'object') {
    return (colorGroup as any)[shade] || '';
  }
  
  return '';
}

/**
 * Get spacing value
 * @example getSpacing('md') => '1rem'
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key];
}

/**
 * Get typography value
 * @example getTypography('fontSize.lg') => '1.125rem'
 */
export function getTypography(path: string): string {
  const [category, key] = path.split('.');
  const typoCategory = typography[category as keyof typeof typography];
  
  if (!typoCategory || typeof typoCategory !== 'object') return '';
  
  return (typoCategory as any)[key] || '';
}

/**
 * Get border radius value
 * @example getBorderRadius('lg') => '0.5rem'
 */
export function getBorderRadius(key: keyof typeof borderRadius): string {
  return borderRadius[key];
}

/**
 * Get shadow value
 * @example getShadow('md') => '0 4px 6px -1px rgb(0 0 0 / 0.1)...'
 */
export function getShadow(key: keyof typeof shadows): string {
  return shadows[key];
}

/**
 * Get icon size
 * @example getIconSize('md') => '1.25rem'
 */
export function getIconSize(key: keyof typeof iconSizes): string {
  return iconSizes[key];
}

/**
 * Get component variant values
 * @example getComponentVariant('button.lg.height') => '2.75rem'
 */
export function getComponentVariant(path: string): string | number {
  const parts = path.split('.');
  let value: any = componentVariants;
  
  for (const part of parts) {
    value = value?.[part];
  }
  
  return value || '';
}

/**
 * Get breakpoint value
 * @example getBreakpoint('lg') => '1024px'
 */
export function getBreakpoint(key: keyof typeof breakpoints): string {
  return breakpoints[key];
}

/**
 * Get z-index value
 * @example getZIndex('modal') => 1050
 */
export function getZIndex(key: keyof typeof zIndex): number {
  return zIndex[key];
}

/**
 * Create media query string
 * @example createMediaQuery('md') => '@media (min-width: 768px)'
 */
export function createMediaQuery(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`;
}

/**
 * Check if current window width matches breakpoint
 * @example matchesBreakpoint('lg') => true/false
 */
export function matchesBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  if (typeof window === 'undefined') return false;
  
  const width = window.innerWidth;
  const breakpointValue = parseInt(breakpoints[breakpoint]);
  
  return width >= breakpointValue;
}

/**
 * Get responsive value based on current viewport
 * @example getResponsiveValue({ mobile: '1rem', desktop: '2rem' })
 */
export function getResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
}): T | undefined {
  if (typeof window === 'undefined') return values.mobile;
  
  const width = window.innerWidth;
  
  if (width >= parseInt(breakpoints.lg) && values.desktop) {
    return values.desktop;
  }
  
  if (width >= parseInt(breakpoints.md) && values.tablet) {
    return values.tablet;
  }
  
  return values.mobile;
}

