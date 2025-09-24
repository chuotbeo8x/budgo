'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState<{ totalUsers: number; activeUsers: number; lockedUsers: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingStats(true);
        const res = await fetch('/api/admin/stats', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        if (data?.success) setStats(data.data);
      } catch {}
      finally { setLoadingStats(false); }
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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bảng điều khiển quản trị</h1>
            <p className="text-sm text-gray-500 mt-1">Tổng quan hệ thống và thao tác quản trị nhanh</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Tổng số người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{loadingStats || !stats ? '—' : stats.totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Cập nhật theo thời gian thực</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Đang hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{loadingStats || !stats ? '—' : stats.activeUsers}</div>
              <div className="text-xs text-gray-500 mt-1">7 ngày gần nhất</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Tài khoản bị khóa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{loadingStats || !stats ? '—' : stats.lockedUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Cần theo dõi</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="w-5 h-5 text-blue-600" /> Quản lý người dùng
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Xem danh sách, khóa/mở khóa, xóa</p>
              <Link href="/admin/users">
                <Button variant="outline">Mở</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Settings className="w-5 h-5 text-emerald-600" /> Cài đặt hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Tiền tệ, chính sách, thông báo</p>
              <Link href="/admin/settings">
                <Button variant="outline">Mở</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="w-5 h-5 text-purple-600" /> Phân quyền & bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Khu vực bảo mật cho quản trị viên. Tính năng chi tiết sẽ bổ sung.</p>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900">Tình trạng hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="list-disc pl-5 space-y-1">
                <li>Firebase Admin: Sẵn sàng</li>
                <li>Dịch vụ nền: Ổn định</li>
                <li>Cảnh báo: Không</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-900">Nhật ký gần đây</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <div className="text-gray-500">Chưa có log hiển thị.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


