'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Settings, Save, AlertTriangle, Moon, Sun, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [copyright, setCopyright] = useState('');
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
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
          setDarkModeEnabled(!!data.data.darkModeEnabled);
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
    // Design System: Clean background, responsive spacing
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header Section - Design System Typography */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-2">
                <Settings className="w-6 h-6 text-primary-600" />
                Cài đặt hệ thống
              </h1>
              <p className="text-sm text-gray-600">
                Quy định chung áp dụng toàn hệ thống
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Admin
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content - Design System: Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* General Settings - Design System: Card with proper shadows */}
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Cấu hình chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Maintenance Toggle - Design System: Form field */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="maintenance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bảo trì hệ thống
                  </Label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Bật để hiển thị trang bảo trì cho người dùng
                  </div>
                </div>
                <input
                  id="maintenance"
                  type="checkbox"
                  className="h-5 w-5 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  checked={maintenanceEnabled}
                  onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                  aria-describedby="maintenance-help"
                />
              </div>

              {/* Dark Mode Feature Toggle - Design System: Form field */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="darkMode" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Chức năng chế độ tối
                  </Label>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Bật để cho phép người dùng chuyển đổi giữa chế độ sáng/tối
                  </div>
                  {darkModeEnabled ? (
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                        <Sun className="w-3 h-3" />
                        <span>Chức năng chế độ tối đang được kích hoạt</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                      <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                        <Monitor className="w-3 h-3" />
                        <span>Chức năng chế độ tối đã bị vô hiệu hóa - tất cả người dùng sẽ thấy chế độ sáng</span>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="darkMode"
                  type="checkbox"
                  className="h-5 w-5 accent-primary-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  checked={darkModeEnabled}
                  onChange={(e) => setDarkModeEnabled(e.target.checked)}
                  aria-describedby="darkmode-help"
                />
              </div>

              {/* Site Name - Design System: Input component */}
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-sm font-medium text-gray-700">
                  Tên hệ thống
                </Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Budgo"
                  className="w-full"
                />
              </div>

              {/* Logo URL - Design System: Input component */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium text-gray-700">
                  Logo URL
                </Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="w-full"
                  aria-describedby="logo-help"
                />
                <p id="logo-help" className="text-xs text-gray-500">
                  Để trống để dùng mặc định
                </p>
              </div>

              {/* Copyright - Design System: Input component */}
              <div className="space-y-2">
                <Label htmlFor="copyright" className="text-sm font-medium text-gray-700">
                  Copyright
                </Label>
                <Input
                  id="copyright"
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  placeholder="© 2025 Tên hệ thống"
                  className="w-full"
                />
              </div>
              {/* Save Button - Design System: Button with proper styling */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button 
                  disabled={saving} 
                  onClick={async () => {
                    try {
                      setSaving(true);
                      const response = await fetch('/api/admin/settings', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ 
                          maintenanceEnabled, 
                          logoUrl: logoUrl.trim() || undefined, 
                          siteName: siteName.trim() || undefined, 
                          copyright: copyright.trim() || undefined, 
                          darkModeEnabled,
                          updatedBy: user?.uid 
                        }) 
                      });
                      
                      if (response.ok) {
                        toast.success('Cài đặt đã được lưu thành công!');
                        if (darkModeEnabled) {
                          toast.info('Chức năng chế độ tối đã được kích hoạt cho toàn hệ thống');
                        } else {
                          toast.warning('Chức năng chế độ tối đã bị vô hiệu hóa - tất cả người dùng sẽ thấy chế độ sáng');
                        }
                      } else {
                        toast.error('Có lỗi xảy ra khi lưu cài đặt');
                      }
                    } catch (error) {
                      toast.error('Có lỗi xảy ra khi lưu cài đặt');
                    } finally { 
                      setSaving(false); 
                    }
                  }}
                  size="sm"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>Lưu cài đặt</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Policies & Notifications - Design System: Card with proper shadows */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <AlertTriangle className="w-5 h-5 text-warning-600" />
                Thông báo & chính sách
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4" role="alert" aria-label="Thông tin phát triển">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-warning-800">
                    <p className="font-medium mb-1">Tính năng đang phát triển</p>
                    <p className="text-xs">Sẽ bổ sung các tùy chọn về email/push, retention logs…</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Các tính năng sắp có:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    Thông báo hệ thống
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    Chính sách quyền riêng tư
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    Điều khoản sử dụng
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}


