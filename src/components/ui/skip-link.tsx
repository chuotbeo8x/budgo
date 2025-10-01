/**
 * Skip Link Component - WCAG 2.4.1 Bypass Blocks
 * 
 * Allows keyboard users to skip repetitive navigation
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({ 
  href = '#main-content', 
  children = 'Skip to main content',
  className 
}: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        // Hidden by default
        'sr-only',
        // Visible on focus - WCAG 2.4.1
        'focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'focus:z-[9999]',
        // Design System styling
        'focus:px-4 focus:py-2',
        'focus:bg-primary-600 focus:text-white',
        'focus:rounded-lg focus:shadow-lg',
        'focus:ring-2 focus:ring-primary-300',
        // Animation
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Multiple Skip Links for complex layouts
 */
export function SkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      <SkipLink href="#navigation">
        Skip to navigation
      </SkipLink>
      <SkipLink href="#footer">
        Skip to footer
      </SkipLink>
    </div>
  );
}

