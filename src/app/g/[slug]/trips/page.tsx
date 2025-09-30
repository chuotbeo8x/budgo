'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getGroupBySlug, getGroupMembers, isGroupMember } from '@/lib/actions/groups';
import { getGroupTrips } from '@/lib/actions/trips';
import { Group, GroupMember, Trip } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Settings,
  UserPlus
} from 'lucide-react';
import TripCreateModal from '@/components/modals/TripCreateModal';


export default function GroupTripsPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadGroup(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (group && user) {
      checkMembership();
      loadMembers();
      loadTrips();
    }
  }, [group, user]);

  const loadGroup = async (groupSlug: string) => {
    try {
      setLoadingGroup(true);
      const groupData = await getGroupBySlug(groupSlug);
      if (groupData) {
        setGroup(groupData);
        setIsOwner(groupData.ownerId === user?.uid);
      } else {
        toast.error('Không tìm thấy nhóm');
        router.push('/groups/manage');
      }
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setLoadingGroup(false);
    }
  };

  const checkMembership = async () => {
    if (!group || !user) return;
    
    try {
      const member = await isGroupMember(group.id, user.uid);
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const loadMembers = async () => {
    if (!group) return;
    
    try {
      const membersData = await getGroupMembers(group.id);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadTrips = async () => {
    if (!group) return;
    
    try {
      setLoadingTrips(true);
      const tripsData = await getGroupTrips(group.id);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    } finally {
      setLoadingTrips(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang diễn ra';
      case 'closed':
        return 'Đã hoàn thành';
      case 'upcoming':
        return 'Sắp diễn ra';
      default:
        return 'Không xác định';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount);
  };

  const filteredAndSortedTrips = trips
    .filter(trip => {
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expense':
          return (b.statsCache?.totalExpense || 0) - (a.statsCache?.totalExpense || 0);
        default:
          return 0;
      }
    });

  if (loading || loadingGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Không tìm thấy nhóm</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Bạn cần là thành viên của nhóm để xem chuyến đi</p>
            <Button 
              onClick={() => router.push(`/g/${group.slug}`)}
              className="w-full mt-4"
            >
              Quay lại trang nhóm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/g/${group.slug}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý chuyến đi</h1>
              <p className="text-gray-600 mt-1">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng chuyến đi</p>
                  <p className="text-2xl font-bold">{trips.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Đang diễn ra</p>
                  <p className="text-2xl font-bold">
                    {trips.filter(trip => trip.status === 'active').length}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Đã hoàn thành</p>
                  <p className="text-2xl font-bold">
                    {trips.filter(trip => trip.status === 'closed').length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Tổng chi phí</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0),
                      trips.length > 0 ? trips[0].currency : 'VND'
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Tên chuyến đi, điểm đến..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="closed">Đã hoàn thành</option>
                  <option value="upcoming">Sắp diễn ra</option>
                </select>
              </div>

              <div>
                <Label htmlFor="sort">Sắp xếp</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="expense">Chi phí cao nhất</option>
                </select>
              </div>

              <div className="flex items-end">
                <TripCreateModal
                  trigger={
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo chuyến đi mới
                    </Button>
                  }
                  groups={[group]} // Pass current group in array to preselect it
                  onSuccess={(tripId, groupId, tripSlug) => {
                    toast.success('Chuyến đi đã được tạo thành công!');
                    if (tripSlug) {
                      router.push(`/g/${group.slug}/trips/${tripSlug}/manage`);
                    }
                    loadTrips();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        {loadingTrips ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>
        ) : filteredAndSortedTrips.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{trip.name}</h3>
                      {trip.destination && (
                        <p className="text-gray-600 flex items-center mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          {trip.destination}
                        </p>
                      )}
                      {trip.description && (
                        <p className="text-gray-500 text-sm mb-3">{trip.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                      </span>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Ngày bắt đầu</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {trip.startDate ? formatDate(trip.startDate) : 'Chưa xác định'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Ngày kết thúc</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {trip.endDate ? formatDate(trip.endDate) : 'Chưa xác định'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        Thành viên
                      </p>
                      <p className="font-semibold text-sm text-gray-900">{trip.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Tổng chi phí
                      </p>
                      <p className="font-semibold text-sm text-gray-900">
                        {formatCurrency(trip.statsCache?.totalExpense || 0, trip.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-400">
                      Tạo lúc: {formatDate(trip.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/g/${group.slug}/trips/${trip.slug}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Xem chi tiết
                      </Button>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/g/${group.slug}/trips/${trip.slug}/manage`)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Quản lý
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'Không tìm thấy chuyến đi' : 'Chưa có chuyến đi nào'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Tạo chuyến đi đầu tiên để bắt đầu quản lý chi phí cùng nhóm'
                  }
                </p>
                <TripCreateModal
                  trigger={
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo chuyến đi mới
                    </Button>
                  }
                  groups={[group]} // Pass current group in array to preselect it
                  onSuccess={(tripId, groupId, tripSlug) => {
                    toast.success('Chuyến đi đã được tạo thành công!');
                    if (tripSlug) {
                      router.push(`/g/${group.slug}/trips/${tripSlug}/manage`);
                    }
                    loadTrips();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Stats */}
        {filteredAndSortedTrips.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Hiển thị {filteredAndSortedTrips.length} trong tổng số {trips.length} chuyến đi
          </div>
        )}
      </div>
    </div>
  );
}



