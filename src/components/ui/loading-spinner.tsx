'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'green' | 'blue' | 'red';
  variant?: 'fast' | 'smooth' | 'pulse';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'border-primary-600 border-r-primary-400 border-b-primary-200',
  white: 'border-white border-r-gray-200 border-b-gray-100',
  gray: 'border-gray-400 border-r-gray-300 border-b-gray-200',
  green: 'border-green-600 border-r-green-400 border-b-green-200',
  blue: 'border-blue-600 border-r-blue-400 border-b-blue-200',
  red: 'border-red-600 border-r-red-400 border-b-red-200'
};

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  variant = 'fast',
  className 
}: LoadingSpinnerProps) {
  const getAnimationClass = () => {
    switch (variant) {
      case 'smooth': return 'loading-spinner-smooth';
      case 'pulse': return 'loading-spinner-smooth';
      default: return 'loading-spinner-fast';
    }
  };
  
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer ring */}
      <div 
        className={cn(
          'absolute inset-0 border-2 border-gray-200 rounded-full',
          sizeClasses[size]
        )}
      />
      {/* Spinning ring */}
      <div 
        className={cn(
          'absolute inset-0 border-2 border-t-transparent rounded-full',
          getAnimationClass(),
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  );
}
