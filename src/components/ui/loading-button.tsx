'use client';

import { Button } from './button';
import LoadingSpinner from './loading-spinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'green' | 'blue' | 'red';
  [key: string]: any;
}

export default function LoadingButton({ 
  loading = false, 
  loadingText, 
  children, 
  className,
  size = 'sm',
  color = 'white',
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={loading}
      className={cn(
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <LoadingSpinner size={size} color={color} className="mr-2" />
          {loadingText || children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
