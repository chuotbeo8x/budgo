'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  size = 32, 
  className = '', 
  fallbackIcon 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  // Validate URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleError = () => {
    console.error('Avatar load error:', src);
    console.error('Full URL:', src);
    console.error('URL length:', src?.length);
    console.error('URL valid:', isValidUrl(src || ''));
    console.error('Retry count:', retryCount);
    console.error('Current URL index:', currentUrlIndex);
    console.error('Display URL:', displayUrl);
    
    const variants = getGoogleAvatarVariants(src || '');
    console.error('Available variants:', variants);
    
    // For Google avatars, try fewer retries and fail faster
    if (src?.includes('googleusercontent.com')) {
      if (currentUrlIndex < 2) { // Only try 3 variants max
        setCurrentUrlIndex(prev => prev + 1);
        setImageLoaded(false);
      } else {
        console.warn('Google avatar failed after 3 attempts, using fallback');
        setImageError(true);
      }
    } else {
      // For other URLs, use original retry logic
      if (currentUrlIndex < variants.length - 1) {
        setCurrentUrlIndex(prev => prev + 1);
        setImageLoaded(false);
      } else if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setCurrentUrlIndex(0);
        setImageLoaded(false);
      } else {
        setImageError(true);
      }
    }
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  // Get alternative URL formats for Google avatars
  const getAlternativeUrl = (originalUrl: string) => {
    if (!originalUrl) return originalUrl;
    
    // Try different Google avatar URL formats
    if (originalUrl.includes('googleusercontent.com')) {
      if (retryCount === 1) {
        // Try with different size parameter
        return originalUrl.replace(/=s\d+-c$/, '=s96-c');
      } else if (retryCount === 2) {
        // Try without size parameter
        return originalUrl.replace(/=s\d+-c$/, '');
      }
    }
    return originalUrl;
  };

  // Fix truncated Google URLs
  const fixGoogleUrl = (url: string) => {
    if (!url || !url.includes('googleusercontent.com')) return url;
    
    // If URL seems truncated, try to reconstruct it
    if (url.length < 100 && url.includes('googleusercontent.com')) {
      console.warn('URL appears truncated:', url);
      // Try to add common Google avatar parameters
      if (!url.includes('=s')) {
        return url + '=s96-c';
      }
    }
    return url;
  };

  // Try different Google avatar URL formats
  const getGoogleAvatarVariants = (url: string) => {
    if (!url || !url.includes('googleusercontent.com')) return [url];
    
    const variants = [url];
    
    // Try different size parameters
    if (url.includes('=s96-c')) {
      variants.push(url.replace('=s96-c', '=s64-c'));
      variants.push(url.replace('=s96-c', '=s128-c'));
    }
    
    // Try with different Google domains
    if (url.includes('lh3.googleusercontent.com')) {
      variants.push(url.replace('lh3.googleusercontent.com', 'lh4.googleusercontent.com'));
    }
    
    return variants;
  };

  const variants = getGoogleAvatarVariants(src || '');
  const displayUrl = variants[currentUrlIndex] || src;

  if (!src || imageError || !isValidUrl(displayUrl)) {
    return (
      <div 
        className={`bg-blue-500 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        {fallbackIcon || <User className="w-5 h-5 text-white" />}
      </div>
    );
  }

  // For Google avatars, add a timeout to fail faster
  const isGoogleAvatar = src?.includes('googleusercontent.com');
  
  // Add timeout for Google avatars to fail faster
  useEffect(() => {
    if (isGoogleAvatar && !imageLoaded && !imageError) {
      const timeout = setTimeout(() => {
        console.warn('Google avatar timeout, using fallback');
        setImageError(true);
      }, 3000); // 3 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isGoogleAvatar, imageLoaded, imageError]);

  // Add a key to force re-render when URL changes
  const imageKey = `${displayUrl}-${currentUrlIndex}-${retryCount}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!imageLoaded && (
        <div 
          className={`bg-gray-200 rounded-full flex items-center justify-center absolute inset-0 ${className}`}
        >
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        key={imageKey}
        src={displayUrl}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin={isGoogleAvatar ? "anonymous" : undefined}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
