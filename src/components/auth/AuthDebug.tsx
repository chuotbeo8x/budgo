'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setDebugInfo({
        currentUrl: typeof window !== 'undefined' ? window.location.href : 'N/A',
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'N/A',
        origin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
        user: user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        } : null,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        timestamp: new Date().toISOString()
      });
    });

    return () => unsubscribe();
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
