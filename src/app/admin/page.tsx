'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Footer from '@/components/Footer';
import LoadingPage from '@/components/ui/loading-page';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, ShieldCheck, Megaphone } from 'lucide-react';
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
    return <LoadingPage message="Đang tải trang quản trị..." />;
  }

  if (!user || (profile as any)?.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-4xl">
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Bạn cần quyền quản trị để truy cập khu vực này.</p>
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
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Bảng điều khiển quản trị</h1>
          <p className="text-gray-600">Tổng quan hệ thống và thao tác quản trị nhanh</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng số người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{loadingStats || !stats ? '—' : stats.totalUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Cập nhật theo thời gian thực</div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Đang hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{loadingStats || !stats ? '—' : stats.activeUsers}</div>
              <div className="text-xs text-gray-500 mt-1">7 ngày gần nhất</div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Tài khoản bị khóa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{loadingStats || !stats ? '—' : stats.lockedUsers}</div>
              <div className="text-xs text-gray-500 mt-1">Cần theo dõi</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 lg:mb-8">
          <Card className="h-full group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="w-5 h-5 text-primary-600" />
                Quản lý người dùng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Xem danh sách, khóa/mở khóa, xóa</p>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full">
                  Mở
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Megaphone className="w-5 h-5 text-warning-600" />
                Gửi thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Gửi thông báo cho tất cả thành viên</p>
              <Link href="/admin/broadcast">
                <Button variant="outline" size="sm" className="w-full">
                  Mở
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Settings className="w-5 h-5 text-success-600" />
                Cài đặt hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Tiền tệ, chính sách, thông báo</p>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" className="w-full">
                  Mở
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="h-full group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <ShieldCheck className="w-5 h-5 text-error-600" />
                Phân quyền & bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Khu vực bảo mật cho quản trị viên. Tính năng chi tiết sẽ bổ sung.</p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Sắp có
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Tình trạng hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Firebase Admin: Sẵn sàng</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Dịch vụ nền: Ổn định</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Cảnh báo: Không</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">Nhật ký gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-gray-500 text-sm">Chưa có log hiển thị</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}


