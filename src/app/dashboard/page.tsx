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
  MapPin
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


  if (loading) {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
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

        {/* Combined Actions and Stats - Improved Color Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Primary Action - Trip Creation (Most Important) */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl ring-4 ring-blue-100 transform hover:scale-105 transition-all duration-200">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/25 rounded-full mb-4 shadow-lg">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Tạo chuyến đi</h3>
                <p className="text-blue-100 text-sm mb-4">Bắt đầu chuyến đi mới và quản lý chi phí</p>
                <Link href="/trips/create">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 w-full shadow-lg font-semibold">
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo chuyến đi
                  </Button>
                </Link>
              </div>
              <div className="border-t border-blue-400/50 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-medium">Tổng chuyến đi</p>
                    <p className="text-3xl font-bold">{trips.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Action - Upcoming Trips */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-md">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-emerald-800 mb-2">Chuyến đi sắp tới</h3>
                <p className="text-emerald-600 text-sm mb-4">Các chuyến đi sắp diễn ra</p>
                <Link href="/trips/manage">
                  <Button size="lg" variant="outline" className="border-emerald-400 text-emerald-700 hover:bg-emerald-50 w-full font-medium">
                    <Calendar className="w-5 h-5 mr-2" />
                    Xem tất cả
                  </Button>
                </Link>
              </div>
              <div className="border-t border-emerald-300 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-xs font-medium">Sắp tới</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      {trips.filter(t => t.startDate && new Date(t.startDate) > new Date()).length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tertiary Action - Ongoing Trips */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4 shadow-md">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-800 mb-2">Chuyến đi đang diễn ra</h3>
                <p className="text-amber-600 text-sm mb-4">Các chuyến đi hiện tại</p>
                <Link href="/trips/manage">
                  <Button size="lg" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50 w-full font-medium">
                    <MapPin className="w-5 h-5 mr-2" />
                    Xem tất cả
                  </Button>
                </Link>
              </div>
              <div className="border-t border-amber-300 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-xs font-medium">Đang diễn ra</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {trips.filter(t => {
                        const now = new Date().getTime();
                        const s = t.startDate ? new Date(t.startDate).getTime() : 0;
                        const e = t.endDate ? new Date(t.endDate).getTime() : Number.MAX_SAFE_INTEGER;
                        return s <= now && now <= e;
                      }).length}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Only - Total Expenses with additional info */}
          <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Tổng chi phí</h3>
                <p className="text-slate-200 text-sm mb-4">Tất cả chuyến đi</p>
                <div className="text-3xl font-bold text-white mb-2">
                  {trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              
              {/* Additional stats */}
              <div className="border-t border-slate-500/30 pt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-slate-300 text-xs font-medium mb-1">Trung bình/chuyến</div>
                    <div className="text-lg font-semibold text-white">
                      {trips.length > 0 
                        ? Math.round(trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0) / trips.length).toLocaleString('vi-VN')
                        : '0'
                      } VNĐ
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-300 text-xs font-medium mb-1">Chuyến đi có chi phí</div>
                    <div className="text-lg font-semibold text-white">
                      {trips.filter(trip => (trip.statsCache?.totalExpense || 0) > 0).length}/{trips.length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Two-column content - Balanced layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Groups Section */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nhóm của bạn</h2>
              <Link href="/groups">
                <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            {loadingGroups ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải nhóm...</p>
                </CardContent>
              </Card>
            ) : groups.length === 0 ? (
              <Card className="border-dashed border-2 border-emerald-200 bg-emerald-50/30">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
                    <Users className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Tạo nhóm đầu tiên</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Tạo nhóm để đi cùng bạn bè và quản lý chuyến đi tập thể
                  </p>
                  <Link href="/groups/create">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Tạo nhóm mới
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg flex-1">
                <CardContent className="p-0 h-full">
                  <ul className="divide-y divide-gray-200 h-full">
                    {groups.map((group) => (
                      <li key={group.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {group.type === 'public' ? (
                              <Globe className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-orange-500" />
                            )}
                            <span className="font-semibold text-gray-900 truncate">{group.name}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {group.memberCount || 0} thành viên • Tạo ngày {formatDate(group.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/g/${group.slug}`}>
                            <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                              <Eye className="w-4 h-4 mr-1" />
                              Xem
                            </Button>
                          </Link>
                          {group.ownerId === user.uid && (
                            <Link href={`/g/${group.slug}/manage`}>
                              <Button size="icon" variant="outline" className="h-8 w-8 border-gray-300">
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

          {/* Trips Section */}
          <div className="flex flex-col h-full">


            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Chuyến đi của bạn</h2>
              <Link href="/trips/manage">
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  Xem tất cả
                </Button>
              </Link>
            </div>

            {loadingTrips ? (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải chuyến đi...</p>
                </CardContent>
              </Card>
            ) : trips.length === 0 ? (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
                <CardContent className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                    <MapPin className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Tạo chuyến đi đầu tiên</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Bắt đầu quản lý chi phí chuyến đi, chia sẻ với bạn bè và tạo những kỷ niệm đáng nhớ
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/trips/create">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                        <Plus className="w-5 h-5 mr-2" /> Tạo chuyến đi
                      </Button>
                    </Link>
                    <Link href="/groups/create">
                      <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Users className="w-5 h-5 mr-2" /> Tạo nhóm
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg flex-1">
                <CardContent className="p-0 h-full">
                  <ul className="divide-y divide-gray-200 h-full">
                    {trips.slice(0, 6).map(trip => {
                      const isGroup = !!trip.groupId;
                      return (
                        <li key={trip.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isGroup ? (
                                <Users className="w-4 h-4 text-blue-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-green-600" />
                              )}
                              <span className="font-semibold text-gray-900 truncate">{trip.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${isGroup ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {isGroup ? 'Nhóm' : 'Cá nhân'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {trip.startDate ? `Ngày đi ${formatDate(trip.startDate)}` : 'Chưa đặt ngày đi'}
                              {trip.endDate ? ` • Ngày về ${formatDate(trip.endDate)}` : ''}
                              {trip.destination ? ` • ${trip.destination}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
                              <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4 mr-1" /> Xem
                              </Button>
                            </Link>
                            {trip.ownerId === user.uid && (
                              <Link href={isGroup ? `/g/${trip.groupId}/trips/${trip.slug}/manage` : `/trips/${trip.slug}/manage`}>
                                <Button size="icon" variant="outline" className="h-8 w-8 border-gray-300">
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