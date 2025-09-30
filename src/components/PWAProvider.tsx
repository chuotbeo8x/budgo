'use client';

import { useEffect } from 'react';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function PWAProvider() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      // Production: register SW normally
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available, reloading...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        window.location.reload();
      });
    } else {
      // Development: aggressively clean up any existing SWs and caches
      (async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            try {
              await reg.unregister();
              console.log('🧹 Unregistered service worker:', reg);
            } catch (e) {
              console.warn('Failed to unregister service worker', e);
            }
          }

          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(
              keys.map(async (key) => {
                try {
                  await caches.delete(key);
                  console.log('🗑️ Deleted cache:', key);
                } catch (e) {
                  console.warn('Failed to delete cache', key, e);
                }
              })
            );
          }

          // Force refresh to ensure no SW-controlled page is cached
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
          }
        } catch (err) {
          console.warn('Dev SW cleanup error:', err);
        }
      })();
    }
  }, []);

  // Only show install prompt in production
  if (process.env.NODE_ENV !== 'production') return null;
  return <PWAInstallPrompt />;
}
