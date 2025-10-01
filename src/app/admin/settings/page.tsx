'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [copyright, setCopyright] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          setMaintenanceEnabled(!!data.data.maintenanceEnabled);
          setLogoUrl(data.data.logoUrl || '');
          setSiteName(data.data.siteName || '');
          setCopyright(data.data.copyright || '');
        }
      } catch {}
    };
    if (user && (profile as any)?.role === 'admin') load();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile as any)?.role !== 'admin') {
    return (
      <div className="bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bạn cần quyền quản trị để truy cập khu vực này.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1">Quy định chung áp dụng toàn hệ thống</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Cấu hình chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance" className="text-sm">Bảo trì hệ thống</Label>
                  <div className="text-xs text-gray-500">Bật để hiển thị trang bảo trì cho người dùng</div>
                </div>
                <input
                  id="maintenance"
                  type="checkbox"
                  className="h-5 w-5 accent-blue-600"
                  checked={maintenanceEnabled}
                  onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                />
              </div>
              <div>
                <Label htmlFor="siteName" className="text-sm">Tên hệ thống</Label>
                <input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="Budgo" />
              </div>
              <div>
                <Label htmlFor="logoUrl" className="text-sm">Logo URL</Label>
                <input id="logoUrl" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="https://.../logo.png" />
                <div className="text-xs text-gray-500 mt-1">Để trống để dùng mặc định</div>
              </div>
              <div>
                <Label htmlFor="copyright" className="text-sm">Copyright</Label>
                <input id="copyright" value={copyright} onChange={(e) => setCopyright(e.target.value)} className="mt-1 w-full p-2 border rounded-md" placeholder="© 2025 Tên hệ thống" />
              </div>
              <div className="flex justify-end">
                <Button disabled={saving} onClick={async () => {
                  try {
                    setSaving(true);
                    await fetch('/api/admin/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ maintenanceEnabled, logoUrl: logoUrl.trim() || undefined, siteName: siteName.trim() || undefined, copyright: copyright.trim() || undefined, updatedBy: user?.uid }) });
                  } finally { setSaving(false); }
                }}>Lưu</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Thông báo & chính sách</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="text-gray-500">Sẽ bổ sung các tùy chọn về email/push, retention logs…</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Thông báo hệ thống</li>
                <li>Chính sách quyền riêng tư</li>
                <li>Điều khoản sử dụng</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}


