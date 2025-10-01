import { colors, spacing, typography, borderRadius, shadows, iconSizes, animations } from '@/lib/design-system';

/**
 * Hook to access design system tokens
 * Usage: const { colors, spacing } = useDesignToken()
 */
export function useDesignToken() {
  return {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    iconSizes,
    animations,
  };
}

/**
 * Get a specific color from the design system
 * Usage: getColor('primary', 600) => '#2563eb'
 */
export function getColor(colorName: keyof typeof colors, shade?: number): string {
  const colorGroup = colors[colorName];
  
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
 * Usage: getSpacing('md') => '1rem'
 */
export function getSpacing(size: keyof typeof spacing): string {
  return spacing[size];
}

/**
 * Get icon size
 * Usage: getIconSize('md') => '1.25rem'
 */
export function getIconSize(size: keyof typeof iconSizes): string {
  return iconSizes[size];
}

