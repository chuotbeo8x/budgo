'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    deferredPrompt: null,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
  });

  useEffect(() => {
    // Check if app is already installed/standalone
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      
      setPwaState(prev => ({
        ...prev,
        isStandalone: isStandaloneMode,
        isInstalled: isStandaloneMode,
      }));
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setPwaState(prev => ({
        ...prev,
        canInstall: true,
        deferredPrompt: prompt,
      }));
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('🎉 PWA was installed');
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        deferredPrompt: null,
      }));
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      checkStandalone();
    };

    // Listen for online/offline status
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
    };
  }, []);

  const installApp = async () => {
    if (!pwaState.deferredPrompt) return false;

    try {
      await pwaState.deferredPrompt.prompt();
      const { outcome } = await pwaState.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        return true;
      } else {
        console.log('❌ User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };

  const updateApp = () => {
    if (pwaState.isUpdateAvailable) {
      window.location.reload();
    }
  };

  return {
    ...pwaState,
    installApp,
    updateApp,
  };
}
