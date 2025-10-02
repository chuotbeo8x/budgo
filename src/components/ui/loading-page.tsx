'use client';

import LoadingSpinner from './loading-spinner';

interface LoadingPageProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'green' | 'blue' | 'red';
  className?: string;
}

export default function LoadingPage({ 
  message = 'Đang tải...', 
  size = 'lg',
  color = 'primary',
  className = ''
}: LoadingPageProps) {
  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-main ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <LoadingSpinner size={size} color={color} variant="pulse" />
            </div>
            <p className="text-lg text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
