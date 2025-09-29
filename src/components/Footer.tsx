'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [copyright, setCopyright] = useState<string>('© 2025 Budgo');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [siteName, setSiteName] = useState<string>('Budgo');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          setLogoUrl(data.data.logoUrl || undefined);
          if (data.data.copyright) setCopyright(data.data.copyright);
          if (data.data.siteName) setSiteName(data.data.siteName);
        }
      } catch {}
    };
    load();
  }, []);

  return (
    <footer className="w-full border-t bg-white hidden md:block">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-5 w-auto" />
          ) : (
            <span className="text-sm font-semibold text-gray-900">{siteName}</span>
          )}
        </div>
        <div className="text-xs text-gray-500">{copyright}</div>
      </div>
    </footer>
  );
}


