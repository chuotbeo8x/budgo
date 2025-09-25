'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { getUserGroups } from '@/lib/actions/groups';
import { getUserTrips } from '@/lib/actions/trips';
import { Group, Trip } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';
import Link from 'next/link';
import TripsListPage from '@/components/TripsListPage';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  UserPlus, 
  Crown, 
  Globe, 
  Lock, 
  Eye,
  Plus,
  BarChart3,
  MapPin,
  Clock,
  Copy,
  Check
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadGroups(),
        loadTrips()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    }
  };

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const groupsData = await getUserGroups(user?.uid || '');
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadTrips = async () => {
    try {
      setLoadingTrips(true);
      const tripsData = await getUserTrips(user?.uid || '');
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  // Helpers for dashboard summaries
  const getLastSixMonths = () => {
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
      months.push({ key, label });
    }
    return months;
  };

  const monthBuckets = (() => {
    const buckets: Record<string, number> = {};
    getLastSixMonths().forEach(m => (buckets[m.key] = 0));
    trips.forEach(trip => {
      const created = trip.createdAt ? new Date(trip.createdAt) : null;
      if (!created) return;
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
      if (buckets[key] !== undefined) {
        buckets[key] += trip.statsCache?.totalExpense || 0;
      }
    });
    return buckets;
  })();

  const costMax = Math.max(1, ...Object.values(monthBuckets));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Bảng điều khiển</h1>
        </div>

        {/* Quick Stats - compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Tổng chuyến đi</p>
                  <p className="text-xl font-bold">{trips.length}</p>
                </div>
                <Calendar className="w-6 h-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Nhóm tham gia</p>
                  <p className="text-xl font-bold">{groups.length}</p>
                </div>
                <Users className="w-6 h-6 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Tổng chi phí</p>
                  <p className="text-xl font-bold">
                    {trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0).toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups Section (compact list) */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Nhóm của bạn</h2>
              <Link href="/groups/create">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Tạo nhóm
                </Button>
              </Link>
            </div>

          {loadingGroups ? (
            <div className="text-center py-6 text-sm text-gray-500">Đang tải nhóm...</div>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có nhóm nào</h3>
                <p className="text-gray-600 mb-6">Tạo nhóm mới để bắt đầu quản lý chuyến đi cùng nhau</p>
                <Link href="/groups/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo nhóm mới
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {groups.map((group) => (
                    <li key={group.id} className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {group.type === 'public' ? (
                            <Globe className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Lock className="w-4 h-4 text-orange-500" />
                          )}
                          <span className="font-medium text-gray-900 truncate">{group.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {group.memberCount || 0} thành viên • Tạo ngày {formatDate(group.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/g/${group.slug}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Xem
                          </Button>
                        </Link>
                        {group.ownerId === user.uid && (
                          <Link href={`/g/${group.slug}/manage`}>
                            <Button size="icon" variant="outline" className="h-8 w-8">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </li>) )}
                </ul>
              </CardContent>
            </Card>
          )}
          </div>

          {/* Trips Section - compact custom list with Upcoming/Ongoing */}
          <div className="lg:col-span-2">
            {/* Cost Summary last 6 months */}
            <Card className="mb-4 md:mb-6">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Tổng chi theo tháng (6 tháng gần đây)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-3">
                  {getLastSixMonths().map((m) => {
                    const val = monthBuckets[m.key] || 0;
                    const height = Math.max(6, Math.round((val / costMax) * 72)); // 6-72px
                    return (
                      <div key={m.key} className="flex flex-col items-center justify-end">
                        <div className="w-6 bg-blue-100 rounded-sm" style={{ height: `${height}px` }}>
                          <div className="w-full h-full bg-blue-500 rounded-sm" />
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming & Ongoing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">Chuyến đi sắp tới</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-200">
                    {trips
                      .filter(t => t.startDate && new Date(t.startDate) > new Date())
                      .sort((a,b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
                      .slice(0,5)
                      .map(t => (
                        <li key={t.id} className="px-4 py-3 text-sm flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{t.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Ngày đi {t.startDate ? formatDate(t.startDate) : '-'}</div>
                          </div>
                          <Link href={t.groupId ? `/g/${t.groupId}/trips/${t.slug}` : `/trips/${t.slug}`}>
                            <Button size="sm" variant="outline">Xem</Button>
                          </Link>
                        </li>
                      ))}
                    {trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-gray-500">Không có chuyến đi sắp tới</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">Chuyến đi đang diễn ra</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-200">
                    {trips
                      .filter(t => {
                        const now = new Date().getTime();
                        const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                        const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                        return s <= now && now <= e;
                      })
                      .slice(0,5)
                      .map(t => (
                        <li key={t.id} className="px-4 py-3 text-sm flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{t.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t.startDate ? formatDate(t.startDate) : '-'} • {t.endDate ? formatDate(t.endDate) : '-'}</div>
                          </div>
                          <Link href={t.groupId ? `/g/${t.groupId}/trips/${t.slug}` : `/trips/${t.slug}`}>
                            <Button size="sm" variant="outline">Vào</Button>
                          </Link>
                        </li>
                      ))}
                    {trips.filter(t => {
                      const now = new Date().getTime();
                      const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                      const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                      return s <= now && now <= e;
                    }).length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-gray-500">Không có chuyến đi đang diễn ra</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Chuyến đi của bạn</h2>
              <div className="flex items-center gap-2">
                <Link href="/trips/create">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-1" /> Tạo chuyến đi
                  </Button>
                </Link>
                <Link href="/trips/manage">
                  <Button size="sm" variant="outline">Xem tất cả</Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity (simple feed based on trips) */}
            <Card className="mt-6">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-gray-900">Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200">
                  {trips.slice(0, 10).map(t => (
                    <li key={`act-${t.id}`} className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">Cập nhật chuyến đi: {t.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Tạo ngày {t.createdAt ? formatDate(t.createdAt) : '-'}</div>
                        </div>
                        <Link href={t.groupId ? `/g/${t.groupId}/trips/${t.slug}` : `/trips/${t.slug}`}>
                          <Button size="sm" variant="outline">Xem</Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                  {trips.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">Chưa có hoạt động</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6" />

            {loadingTrips ? (
              <div className="text-center py-6 text-sm text-gray-500">Đang tải chuyến đi...</div>
            ) : trips.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có chuyến đi nào</h3>
                  <p className="text-gray-600 mb-6">Tạo chuyến đi mới để bắt đầu quản lý chi phí</p>
                  <Link href="/trips/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" /> Tạo chuyến đi
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-200">
                    {trips.slice(0, 8).map(trip => {
                      const isGroup = !!trip.groupId;
                      return (
                        <li key={trip.id} className="p-4 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {isGroup ? (
                                <Users className="w-4 h-4 text-blue-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-green-600" />
                              )}
                              <span className="font-medium text-gray-900 truncate">{trip.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${isGroup ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {isGroup ? 'Nhóm' : 'Cá nhân'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {trip.startDate ? `Ngày đi ${formatDate(trip.startDate)}` : 'Chưa đặt ngày đi'}
                              {trip.endDate ? ` • Ngày về ${formatDate(trip.endDate)}` : ''}
                              {trip.destination ? ` • ${trip.destination}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" /> Xem
                              </Button>
                            </Link>
                            {trip.ownerId === user.uid && (
                              <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}/manage` : `/trips/${trip.slug}/manage`}>
                                <Button size="icon" variant="outline" className="h-8 w-8">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}