'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '@/components/auth/ProfileProvider';
import { usePathname } from 'next/navigation';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { profile } = useProfile();
  const pathname = usePathname();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          setEnabled(!!data.data.maintenanceEnabled);
        }
      } catch {}
      finally { setLoaded(true); }
    };
    load();
  }, []);

  if (!loaded) return null;
  if (!enabled) return <>{children}</>;
  if ((profile as any)?.role === 'admin') return <>{children}</>;
  // Allowlisted routes accessible during maintenance
  const allowList = [/^\/profiles\//, /^\/settings$/];
  if (allowList.some((re) => re.test(pathname))) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-3xl font-semibold text-gray-900 mb-2">Hệ thống đang bảo trì</div>
        <p className="text-sm text-gray-600">Vui lòng quay lại sau. Chúng tôi đang nâng cấp để phục vụ bạn tốt hơn.</p>
      </div>
    </div>
  );
}


