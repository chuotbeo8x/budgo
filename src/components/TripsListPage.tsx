'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip, getTripType, getTripTypeLabel, getTripTypeIcon } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Eye,
  BarChart3,
  Clock,
  AlertCircle,
  Globe,
  Building,
  Plane,
  Car,
  Home,
  Settings
} from 'lucide-react';

interface TripsListPageProps {
  trips: Trip[];
  loading: boolean;
  groupSlug?: string; // Optional for group trips
  groupName?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
  createTripUrl: string;
  createTripLabel: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export default function TripsListPage({ 
  trips, 
  loading, 
  groupSlug, 
  groupName,
  backUrl, 
  backLabel, 
  createTripUrl, 
  createTripLabel,
  emptyStateTitle,
  emptyStateDescription
}: TripsListPageProps) {
  const { user } = useAuth();
  const [tripFilter, setTripFilter] = useState<'all' | 'personal' | 'group'>('all');

  // Filter trips based on selected filter
  const filteredTrips = trips.filter(trip => {
    if (tripFilter === 'all') return true;
    if (tripFilter === 'personal') return !trip.groupId;
    if (tripFilter === 'group') return trip.groupId;
    return true;
  });

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

  const getTripStatusColor = (trip: Trip) => {
    if (trip.status === 'closed') return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getTripStatusText = (trip: Trip) => {
    if (trip.status === 'closed') return 'Đã đóng';
    return 'Đang hoạt động';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={backUrl}>
              <Button variant="outline" className="flex items-center gap-2">
                ← {backLabel}
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {groupName ? `Chuyến đi trong nhóm ${groupName}` : 'Danh sách chuyến đi'}
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              {groupName ? 'Quản lý và theo dõi các chuyến đi trong nhóm' : 'Quản lý và theo dõi tất cả chuyến đi của bạn'}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        {!groupSlug && (
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setTripFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tripFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setTripFilter('personal')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tripFilter === 'personal'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cá nhân
              </button>
              <button
                onClick={() => setTripFilter('group')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tripFilter === 'group'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nhóm
              </button>
            </div>
          </div>
        )}

        {/* Create Trip Button */}
        <div className="flex justify-center mb-8">
          <Link href={createTripUrl}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              {createTripLabel}
            </Button>
          </Link>
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{emptyStateTitle}</h3>
            <p className="text-gray-600 mb-6">{emptyStateDescription}</p>
            <Link href={createTripUrl}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                {createTripLabel}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const tripUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`;
              const manageUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/manage` : `/trips/${trip.slug}/manage`;
              
              return (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTripIcon(trip)}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {trip.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">
                              {getTripTypeLabel(trip)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTripStatusColor(trip)}`}>
                              {getTripStatusText(trip)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Trip Details */}
                    <div className="space-y-2">
                      {trip.destination && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{trip.destination}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {trip.startDate ? formatDate(trip.startDate) : 'Chưa xác định'} - {trip.endDate ? formatDate(trip.endDate) : 'Chưa xác định'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{trip.currency}</span>
                      </div>
                    </div>

                    {/* Trip Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {trip.statsCache?.totalExpense ? formatCurrency(trip.statsCache.totalExpense, trip.currency) : '0'}
                        </div>
                        <div className="text-xs text-gray-500">Tổng chi phí</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {trip.memberCount || 0}
                        </div>
                        <div className="text-xs text-gray-500">Thành viên</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Link href={tripUrl} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </Link>
                      {user?.uid === trip.ownerId && (
                        <Link href={manageUrl}>
                          <Button variant="outline" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
