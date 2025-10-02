'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import LoadingPage from '@/components/ui/loading-page';
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
  Sunset,
  CheckCircle,
  XCircle,
  Clock
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

  // Helper functions for trip display
  const getTripTypeInfo = (trip: Trip) => {
    if (trip.groupId) {
      return {
        icon: Users,
        label: 'Nhóm',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      };
    }
    return {
      icon: MapPin,
      label: 'Cá nhân',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Đang hoạt động',
          labelShort: 'Hoạt động',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Đã hoàn thành',
          labelShort: 'Hoàn thành',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'closed':
        return {
          icon: XCircle,
          label: 'Đã đóng',
          labelShort: 'Đóng',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: Clock,
          label: 'Chưa xác định',
          labelShort: 'Chưa xác định',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

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
    return <LoadingPage message="Đang tải dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Bảng điều khiển - Budgo</title>
        <meta name="description" content="Quản lý chuyến đi và nhóm của bạn một cách thông minh. Theo dõi chi phí, lên kế hoạch chuyến đi và kết nối với bạn bè." />
        <meta name="keywords" content="quản lý chuyến đi, nhóm du lịch, chia sẻ chi phí, lập kế hoạch du lịch, budgo" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Bảng điều khiển - Budgo" />
        <meta property="og:description" content="Quản lý chuyến đi và nhóm của bạn một cách thông minh" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Bảng điều khiển - Budgo" />
        <meta name="twitter:description" content="Quản lý chuyến đi và nhóm của bạn một cách thông minh" />
        <link rel="canonical" href="https://budgo.app/dashboard" />
      </Head>
      
      {/* Design System: Mobile-first layout */}
      {/* Padding: mobile 1rem (16px), desktop 2rem (32px) */}
      {/* Max-width: 7xl (1280px) */}
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header - Design System Typography with SEO optimization */}
        <header className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Bảng điều khiển</h1>
          <p className="text-sm text-gray-600 mt-1">Tổng quan chuyến đi và nhóm của bạn</p>
        </header>

        {/* Quick Stats Bar - Design System: Card spacing with semantic HTML */}
        <section className="mb-6 lg:mb-8" aria-label="Thống kê tổng quan">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Stat Item */}
              <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Tổng số chuyến đi">
                <p className="text-3xl font-bold text-primary-600" aria-label={`${trips.length} chuyến đi`}>{trips.length}</p>
                <p className="text-sm text-gray-600 mt-1">Tổng chuyến đi</p>
              </article>
              <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Chuyến đi sắp tới">
                <p className="text-3xl font-bold text-success-600" aria-label={`${trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length} chuyến đi sắp tới`}>
                  {trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Sắp tới</p>
              </article>
              <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Chuyến đi đang diễn ra">
                <p className="text-3xl font-bold text-warning-600" aria-label={`${trips.filter(t => {
                  const now = new Date().getTime();
                  const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                  const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                  return s <= now && now <= e;
                }).length} chuyến đi đang diễn ra`}>
                  {trips.filter(t => {
                    const now = new Date().getTime();
                    const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                    const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                    return s <= now && now <= e;
                  }).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Đang diễn ra</p>
              </article>
              <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Tổng chi phí">
                <p className="text-xl lg:text-2xl font-bold text-gray-700" aria-label={`${trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0).toLocaleString('vi-VN')} VND`}>
                  {trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-sm text-gray-600 mt-1">Tổng chi phí</p>
              </article>
            </div>
          </CardContent>
          </Card>
        </section>

        {/* Two-column content - Design System: Responsive gap with semantic HTML */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8" role="main" aria-label="Nội dung chính">
          {/* Trips Section */}
          <section className="flex flex-col h-full" aria-labelledby="trips-heading">
            <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
              <h2 id="trips-heading" className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Chuyến đi của bạn</h2>
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
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4" aria-hidden="true">
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
                          router.push(`/trips/${tripSlug}/manage`);
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
                  <ul className="divide-y divide-gray-100" role="list" aria-label="Danh sách chuyến đi">
                    {trips.slice(0, 6).map(trip => {
                      const typeInfo = getTripTypeInfo(trip);
                      const statusInfo = getStatusInfo(trip.status);
                      const TypeIcon = typeInfo.icon;
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <li key={trip.id} className="p-3 md:p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" role="listitem">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              <TypeIcon className="w-4 h-4" aria-hidden="true" />
                              <span className="font-semibold text-gray-900 truncate">{trip.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.bgColor} ${typeInfo.color}`} aria-label={typeInfo.label}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              {trip.startDate ? (
                                <>
                                  <Plane className="w-3 h-3 text-primary-600" aria-hidden="true" />
                                  <span>{formatDate(trip.startDate)}</span>
                                </>
                              ) : (
                                <span>Chưa đặt ngày đi</span>
                              )}
                              {trip.endDate && (
                                <>
                                  <span aria-hidden="true">•</span>
                                  <Home className="w-3 h-3 text-warning-600" aria-hidden="true" />
                                  <span>{formatDate(trip.endDate)}</span>
                                </>
                              )}
                              {trip.destination && (
                                <>
                                  <span aria-hidden="true">•</span>
                                  <MapPin className="w-3 h-3 text-error-600" aria-hidden="true" />
                                  <span>{trip.destination}</span>
                                </>
                              )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <Link href={`/trips/${trip.slug}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" /> Xem
                            </Button>
                          </Link>
                            {trip.ownerId === user.uid && (
                              <Link href={`/trips/${trip.slug}/manage`}>
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
          </section>

          {/* Groups Section */}
          <section className="flex flex-col h-full" aria-labelledby="groups-heading">
            <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6">
              <h2 id="groups-heading" className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Nhóm của bạn</h2>
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
                  <ul className="divide-y divide-gray-100" role="list" aria-label="Danh sách nhóm">
                    {groups.map((group) => (
                      <li key={group.id} className="p-3 md:p-4 lg:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" role="listitem">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {group.type === 'public' ? (
                              <Globe className="w-4 h-4 text-success-600" aria-hidden="true" />
                            ) : (
                              <Lock className="w-4 h-4 text-warning-600" aria-hidden="true" />
                            )}
                            <span className="font-semibold text-gray-900 truncate">{group.name}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary-600" aria-hidden="true" />
                            <span>{group.memberCount || 0} thành viên</span>
                            <span aria-hidden="true">•</span>
                            <Calendar className="w-3 h-3 text-success-600" aria-hidden="true" />
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
          </section>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}