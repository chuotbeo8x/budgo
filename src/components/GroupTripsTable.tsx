'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/lib/types';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import TripCreateModal from '@/components/modals/TripCreateModal';
import { 
  Plus, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  Search,
  Filter,
  Eye,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Building,
  Plane,
  Car,
  Home
} from 'lucide-react';

interface GroupTripsTableProps {
  trips: Trip[];
  loading: boolean;
  groupSlug: string;
  groupName: string;
  createTripUrl: string;
  createTripLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export default function GroupTripsTable({ 
  trips, 
  loading, 
  groupSlug,
  groupName,
  createTripUrl, 
  createTripLabel,
  emptyStateTitle,
  emptyStateDescription
}: GroupTripsTableProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'startDate'>('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const filteredAndSortedTrips = trips
    .filter(trip => {
      // Filter by search term
      const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
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

  const getTripIcon = (trip: Trip) => {
    const categoryIcons: { [key: string]: any } = {
      'travel': Globe,
      'business': Building,
      'vacation': Plane,
      'road-trip': Car,
      'staycation': Home,
    };
    
    const IconComponent = categoryIcons[trip.category || ''] || Globe;
    return <IconComponent className="w-6 h-6" />;
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
      case 'closed':
        return {
          icon: AlertCircle,
          label: 'Đã đóng',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: Clock,
          label: 'Sắp tới',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
    }
  };

  // Calculate stats
  const totalTrips = trips.length;
  const activeTrips = trips.filter(t => t.status === 'active').length;
  const closedTrips = trips.filter(t => t.status === 'closed').length;
  const totalExpense = trips.reduce((sum, trip) => sum + (trip.statsCache?.totalExpense || 0), 0);
  const averageExpense = totalTrips > 0 ? totalExpense / totalTrips : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Đang tải danh sách chuyến đi...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats Dashboard - Dashboard Style */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Tổng số chuyến đi">
              <p className="text-3xl font-bold text-primary-600" aria-label={`${totalTrips} chuyến đi`}>{totalTrips}</p>
              <p className="text-sm text-gray-600 mt-1">Tổng chuyến đi</p>
            </article>
            <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Chuyến đi đang hoạt động">
              <p className="text-3xl font-bold text-success-600" aria-label={`${activeTrips} chuyến đi đang hoạt động`}>{activeTrips}</p>
              <p className="text-sm text-gray-600 mt-1">Đang hoạt động</p>
            </article>
            <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Chuyến đi đã đóng">
              <p className="text-3xl font-bold text-error-600" aria-label={`${closedTrips} chuyến đi đã đóng`}>{closedTrips}</p>
              <p className="text-sm text-gray-600 mt-1">Đã đóng</p>
            </article>
            <article className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors" aria-label="Tổng chi phí">
              <p className="text-xl lg:text-2xl font-bold text-gray-700" aria-label={`${formatCurrency(totalExpense, 'VND')} tổng chi phí`}>
                {formatCurrency(totalExpense, 'VND')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tổng chi phí</p>
            </article>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyến đi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'startDate')}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="startDate">Ngày đi</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips List */}
      {filteredAndSortedTrips.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {emptyStateTitle}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {emptyStateDescription}
              </p>
              <TripCreateModal
                trigger={
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {createTripLabel}
                  </Button>
                }
                groups={[{ slug: groupSlug, name: groupName } as any]} // Pass current group in array
                onSuccess={() => {
                  // Reload page or trigger parent refresh
                  window.location.reload();
                }}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedTrips.map((trip) => {
              const statusInfo = getStatusInfo(trip.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={trip.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-100 rounded-lg">
                          {getTripIcon(trip)}
                        </div>
                        <span className="text-sm font-semibold text-primary-600">
                          Nhóm
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusInfo.label}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
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
                        <Link href={`/g/${groupSlug}/trips/${trip.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chuyến đi
                          </Button>
                        </Link>
                        
                        {user?.uid === trip.ownerId && (
                          <Link href={`/g/${groupSlug}/trips/${trip.slug}/manage`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Settings className="w-4 h-4 mr-2" />
                              Quản lý
                            </Button>
                          </Link>
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
            <div className="mt-6 lg:mt-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
