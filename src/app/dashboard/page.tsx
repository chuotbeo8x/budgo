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
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  UserPlus, 
  Globe, 
  Lock, 
  Eye,
  Plus,
  MapPin,
  Plane,
  Home,
  Sunrise,
  Sunset
} from 'lucide-react';
import GroupCreateModal from '@/components/modals/GroupCreateModal';
import TripCreateModal from '@/components/modals/TripCreateModal';

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


  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
          <div className="text-center text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    // Design System: Mobile-first layout
    // Padding: mobile 1rem (16px), desktop 2rem (32px)
    // Max-width: 7xl (1280px)
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header - Design System Typography */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Bảng điều khiển</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng quan chuyến đi và nhóm của bạn</p>
        </div>

        {/* Quick Stats Bar - Design System: Card spacing */}
        <Card className="mb-6 lg:mb-8">
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Stat Item */}
              <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-3xl font-bold text-primary-600">{trips.length}</p>
                <p className="text-sm text-gray-600 mt-1">Tổng chuyến đi</p>
              </div>
              <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-3xl font-bold text-success-600">
                  {trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Sắp tới</p>
              </div>
              <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-3xl font-bold text-warning-600">
                  {trips.filter(t => {
                    const now = new Date().getTime();
                    const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                    const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                    return s <= now && now <= e;
                  }).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Đang diễn ra</p>
              </div>
              <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-xl lg:text-2xl font-bold text-gray-700">
                  {trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-sm text-gray-600 mt-1">Tổng chi phí</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column content - Design System: Responsive gap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {/* Trips Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Chuyến đi của bạn</h2>
              <Link href="/trips/manage">
                <Button size="sm" variant="outline">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            {loadingTrips ? (
              <Card>
                <CardContent className="text-center py-6">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Đang tải chuyến đi...</p>
                </CardContent>
              </Card>
            ) : trips.length === 0 ? (
              <Card className="border-dashed border-2 border-primary-200 bg-primary-50/30">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <MapPin className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tạo chuyến đi đầu tiên</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">
                    Tạo chuyến đi cá nhân hoặc chọn nhóm để quản lý chi phí cùng bạn bè
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <TripCreateModal
                      trigger={
                        <Button>
                          <Plus className="w-4 h-4" /> Tạo chuyến đi
                        </Button>
                      }
                      groups={groups}
                      onSuccess={(tripId, groupId, tripSlug) => {
                        toast.success('Chuyến đi đã được tạo thành công!');
                        if (groupId) {
                          // Find group slug for redirect
                          const group = groups.find(g => g.id === groupId);
                          if (group) {
                            router.push(`/g/${group.slug}/trips/${tripSlug}/manage`);
                          } else {
                            router.push(`/trips/${tripSlug}/manage`);
                          }
                        } else {
                          router.push(`/trips/${tripSlug}/manage`);
                        }
                        loadTrips(); // Reload trips list
                      }}
                    />
                  <GroupCreateModal
                    trigger={
                        <Button variant="outline">
                          <Users className="w-4 h-4" /> Tạo nhóm
                      </Button>
                    }
                    onSuccess={(groupId) => {
                      toast.success('Nhóm đã được tạo thành công!');
                      router.push(`/g/${groupId}`);
                        loadGroups(); // Reload groups list
                    }}
                  />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1">
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {trips.slice(0, 6).map(trip => {
                      const isGroup = !!trip.groupId;
                      return (
                        <li key={trip.id} className="p-3 md:p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              {isGroup ? (
                                <Users className="w-4 h-4 text-primary-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-success-600" />
                              )}
                              <span className="font-semibold text-gray-900 truncate">{trip.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isGroup ? 'bg-primary-100 text-primary-700' : 'bg-success-100 text-success-700'}`}>
                                {isGroup ? 'Nhóm' : 'Cá nhân'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              {trip.startDate ? (
                                <>
                                  <Plane className="w-3 h-3 text-primary-600" />
                                  <span>{formatDate(trip.startDate)}</span>
                                </>
                              ) : (
                                <span>Chưa đặt ngày đi</span>
                              )}
                              {trip.endDate && (
                                <>
                                  <span>•</span>
                                  <Home className="w-3 h-3 text-warning-600" />
                                  <span>{formatDate(trip.endDate)}</span>
                                </>
                              )}
                              {trip.destination && (
                                <>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3 text-error-600" />
                                  <span>{trip.destination}</span>
                                </>
                              )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" /> Xem
                            </Button>
                          </Link>
                            {trip.ownerId === user.uid && (
                              <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}/manage` : `/trips/${trip.slug}/manage`}>
                              <Button size="icon-sm" variant="outline">
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

          {/* Groups Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Nhóm của bạn</h2>
              <Link href="/groups/manage">
                <Button size="sm" variant="outline">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            {loadingGroups ? (
              <Card>
                <CardContent className="text-center py-6">
                  <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">Đang tải nhóm...</p>
                </CardContent>
              </Card>
            ) : groups.length === 0 ? (
              <Card className="border-dashed border-2 border-primary-200 bg-primary-50/30">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Tạo nhóm đầu tiên</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto text-sm">
                    Tạo nhóm để đi cùng bạn bè và quản lý chuyến đi tập thể
                  </p>
                  <GroupCreateModal
                    trigger={
                      <Button>
                        <Plus className="w-4 h-4" />
                        Tạo nhóm
                      </Button>
                    }
                    onSuccess={(groupId) => {
                      toast.success('Nhóm đã được tạo thành công!');
                      router.push(`/g/${groupId}`);
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1">
                <CardContent className="p-0">
                  <ul className="divide-y divide-gray-100">
                    {groups.map((group) => (
                      <li key={group.id} className="p-3 md:p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {group.type === 'public' ? (
                              <Globe className="w-4 h-4 text-success-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-warning-600" />
                            )}
                            <span className="font-semibold text-gray-900 truncate">{group.name}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary-600" />
                            <span>{group.memberCount || 0} thành viên</span>
                            <span>•</span>
                            <Calendar className="w-3 h-3 text-success-600" />
                            <span>{formatDate(group.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/g/${group.slug}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" /> Xem
                            </Button>
                          </Link>
                          {group.ownerId === user.uid && (
                            <Link href={`/g/${group.slug}/manage`}>
                              <Button size="icon-sm" variant="outline">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </li>
                    ))}
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