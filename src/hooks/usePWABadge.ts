'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

/**
 * PWA Badge Hook
 * Manages app badge notifications for installed PWA
 */
export function usePWABadge() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    // Check if PWA badge API is supported
    if (!('setAppBadge' in navigator)) {
      console.log('PWA Badge API not supported');
      return;
    }

    // Check if app is installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    if (!isStandalone) {
      console.log('App not installed, skipping badge');
      return;
    }

    // Set up badge based on user's unread notifications
    const updateBadge = async () => {
      try {
        // Get unread notifications count
        const response = await fetch(`/api/notifications/unread-count?userId=${user.uid}`);
        const data = await response.json();
        
        if (data.success && data.count > 0) {
          await navigator.setAppBadge(data.count);
          console.log(`PWA Badge set to: ${data.count}`);
        } else {
          await navigator.clearAppBadge();
          console.log('PWA Badge cleared');
        }
      } catch (error) {
        console.error('Error updating PWA badge:', error);
      }
    };

    // Update badge on mount
    updateBadge();

    // Set up periodic updates (every 30 seconds)
    const interval = setInterval(updateBadge, 30000);

    // Clean up on unmount
    return () => {
      clearInterval(interval);
      // Clear badge when component unmounts
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge();
      }
    };
  }, [user]);

  // Return badge control functions
  const setBadge = async (count: number) => {
    if (!('setAppBadge' in navigator)) return;
    
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (error) {
      console.error('Error setting PWA badge:', error);
    }
  };

  const clearBadge = async () => {
    if (!('clearAppBadge' in navigator)) return;
    
    try {
      await navigator.clearAppBadge();
    } catch (error) {
      console.error('Error clearing PWA badge:', error);
    }
  };

  return { setBadge, clearBadge };
}
