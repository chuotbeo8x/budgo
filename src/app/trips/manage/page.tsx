'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserTrips } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { toast } from 'sonner';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Settings,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function TripsManagePage() {
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'startDate'>('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 items per page for 3x4 grid

  useEffect(() => {
    if (!loading && user) {
      loadTrips();
    }
  }, [loading, user]);

  const loadTrips = async () => {
    if (!user) return;
    
    try {
      setLoadingTrips(true);
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    } finally {
      setLoadingTrips(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy]);

  const filteredAndSortedTrips = trips
    .filter(trip => {
      // Filter by search term
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by type
      const matchesType = filterType === 'all' || 
                         (filterType === 'personal' && !trip.groupId) ||
                         (filterType === 'group' && trip.groupId);
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'createdAt':
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime; // Newest first
        case 'startDate':
          if (!a.startDate && !b.startDate) return 0;
          if (!a.startDate) return 1;
          if (!b.startDate) return -1;
          const aStartTime = a.startDate instanceof Date ? a.startDate.getTime() : new Date(a.startDate).getTime();
          const bStartTime = b.startDate instanceof Date ? b.startDate.getTime() : new Date(b.startDate).getTime();
          return aStartTime - bStartTime; // Earliest first
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredAndSortedTrips.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          label: 'Đang hoạt động',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Hoàn thành',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
      case 'upcoming':
        return {
          icon: Clock,
          label: 'Sắp tới',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Không xác định',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  // Calculate stats
  const totalTrips = trips.length;
  const personalTrips = trips.filter(t => !t.groupId).length;
  const groupTrips = trips.filter(t => t.groupId).length;
  const activeTrips = trips.filter(t => t.status === 'active').length;
  const totalExpense = trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0);
  const averageExpense = totalTrips > 0 ? totalExpense / totalTrips : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Đăng nhập để quản lý chuyến đi của bạn"
        icon={<MapPin className="w-8 h-8 text-blue-600" />}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section (aligned with Groups Manage) */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý chuyến đi</h1>
              <p className="text-lg text-gray-600">Quản lý tất cả chuyến đi cá nhân và nhóm của bạn</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/trips/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo chuyến đi mới
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng chuyến đi</p>
                  <p className="text-3xl font-bold">{totalTrips}</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Cá nhân</p>
                  <p className="text-3xl font-bold">{personalTrips}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Nhóm</p>
                  <p className="text-3xl font-bold">{groupTrips}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Đang hoạt động</p>
                  <p className="text-3xl font-bold">{activeTrips}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chuyến đi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter and Sort Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filter Type - Mobile: Stack vertically, Desktop: Horizontal */}
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <Button
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterType('all')}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Tất cả</span>
                    <span className="sm:hidden">Tất cả ({totalTrips})</span>
                    <span className="hidden sm:inline">({totalTrips})</span>
                  </Button>
                  <Button
                    variant={filterType === 'personal' ? 'default' : 'outline'}
                    onClick={() => setFilterType('personal')}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Cá nhân</span>
                    <span className="sm:hidden">Cá nhân ({personalTrips})</span>
                    <span className="hidden sm:inline">({personalTrips})</span>
                  </Button>
                  <Button
                    variant={filterType === 'group' ? 'default' : 'outline'}
                    onClick={() => setFilterType('group')}
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Nhóm</span>
                    <span className="sm:hidden">Nhóm ({groupTrips})</span>
                    <span className="hidden sm:inline">({groupTrips})</span>
                  </Button>
                </div>

                {/* Sort - Mobile: Full width, Desktop: Auto width */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'startDate')}
                    className="flex-1 sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="createdAt">Mới nhất</option>
                    <option value="name">Tên A-Z</option>
                    <option value="startDate">Ngày đi</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        {loadingTrips ? (
          <Card className="shadow-md">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600">Đang tải danh sách chuyến đi...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredAndSortedTrips.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {filterType === 'all' ? 'Chưa có chuyến đi nào' :
                   filterType === 'personal' ? 'Chưa có chuyến đi cá nhân nào' :
                   'Chưa có chuyến đi nhóm nào'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {filterType === 'all' ? 'Bạn chưa tạo chuyến đi nào. Hãy tạo chuyến đi đầu tiên để bắt đầu!' :
                   filterType === 'personal' ? 'Bạn chưa tạo chuyến đi cá nhân nào.' :
                   'Bạn chưa tạo chuyến đi nhóm nào.'}
                </p>
                <Link href="/trips/create">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Tạo chuyến đi đầu tiên
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedTrips.map((trip) => {
              const typeInfo = getTripTypeInfo(trip);
              const statusInfo = getStatusInfo(trip.status);
              const TypeIcon = typeInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={trip.id} className="group hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                          <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                        </div>
                        <span className={`text-sm font-semibold ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {trip.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      {trip.description || 'Không có mô tả'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Trip Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {trip.startDate && (
                          <div>
                            <p className="text-gray-500 font-medium uppercase tracking-wide">Ngày đi</p>
                            <p className="font-semibold text-gray-900">{formatDate(trip.startDate)}</p>
                          </div>
                        )}
                        {trip.endDate && (
                          <div>
                            <p className="text-gray-500 font-medium uppercase tracking-wide">Ngày về</p>
                            <p className="font-semibold text-gray-900">{formatDate(trip.endDate)}</p>
                          </div>
                        )}
                        {trip.destination && (
                          <div>
                            <p className="text-gray-500 font-medium uppercase tracking-wide">Địa điểm</p>
                            <p className="font-semibold text-gray-900">{trip.destination}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500 font-medium uppercase tracking-wide">Thành viên</p>
                          <p className="font-semibold text-gray-900">{trip.memberCount ?? 0}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        {trip.groupId ? (
                          <Link href={`/g/${trip.groupId}/trips/${trip.slug}`} className="flex-1">
                            <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700">
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chuyến đi
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/trips/${trip.slug}`} className="flex-1">
                            <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700">
                              <Eye className="w-4 h-4 mr-2" />
                              Xem chuyến đi
                            </Button>
                          </Link>
                        )}
                        
                        {user.uid === trip.ownerId && (
                          <>
                            {trip.groupId ? (
                              <Link href={`/g/${trip.groupId}/trips/${trip.slug}/manage`} className="flex-1">
                                <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:border-green-200 group-hover:text-green-700">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Quản lý
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/trips/${trip.slug}/manage`} className="flex-1">
                                <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:border-green-200 group-hover:text-green-700">
                                  <Settings className="w-4 h-4 mr-2" />
                                  Quản lý
                                </Button>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant={currentPage === 1 ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(1)}
                          className="w-10 h-10"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {/* Pages around current page */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                      if (page < 1 || page > totalPages) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      );
                    })}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="w-10 h-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Sau
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Stats */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-blue-600">{startIndex + 1}-{Math.min(endIndex, filteredAndSortedTrips.length)}</span> / <span className="font-semibold text-gray-900">{filteredAndSortedTrips.length}</span> chuyến đi
            {totalPages > 1 && (
              <span className="ml-2 text-gray-500">
                (Trang {currentPage}/{totalPages})
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
