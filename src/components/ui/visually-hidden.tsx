/**
 * VisuallyHidden Component
 * 
 * Hides content visually but keeps it accessible to screen readers
 * Use for:
 * - Icon button labels
 * - Additional context for screen readers
 * - Skip links
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  focusable?: boolean;
}

export function VisuallyHidden({ 
  children, 
  focusable = false,
  className,
  ...props 
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'sr-only',
        focusable && 'focus:not-sr-only focus:absolute focus:p-2',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Screen Reader Only text
 * Alias for VisuallyHidden
 */
export const SROnly = VisuallyHidden;

