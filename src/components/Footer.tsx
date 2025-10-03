'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [copyright, setCopyright] = useState<string>('© 2025 Budgo');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          if (data.data.copyright) setCopyright(data.data.copyright);
        }
      } catch {}
    };
    load();
  }, []);

  return (
    <footer className="mt-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <hr className="border-gray-200 mb-4" />
        <div className="py-4 text-center">
          <div className="text-sm text-gray-500">
            {copyright} • Quản lý nhóm và chuyến đi
          </div>
        </div>
      </div>
    </footer>
  );
}


