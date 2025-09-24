'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';
import { getGroupTrips } from '@/lib/actions/trips';

interface Trip {
  id: string;
  name: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  currency: string;
  memberCount: number;
  totalExpense: number;
  status: 'active' | 'completed' | 'upcoming';
  description?: string;
  category?: string;
  createdAt: Date;
}

interface GroupTripsProps {
  groupId: string;
  groupSlug: string;
  isOwner: boolean;
  loading?: boolean;
}

export default function GroupTrips({ groupId, groupSlug, isOwner, loading: externalLoading }: GroupTripsProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [groupId]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await getGroupTrips(groupId);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      // Fallback to empty array on error
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Use external loading state if provided, otherwise use internal state
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
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
      case 'completed':
        return 'Đã hoàn thành';
      case 'upcoming':
        return 'Sắp tới';
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Chuyến đi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Chuyến đi ({trips.length})
          </CardTitle>
          <Link href={`/trips/create?groupId=${groupId}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tạo chuyến đi
            </Button>
          </Link>
        </div>
        <CardDescription>
          Danh sách các chuyến đi trong nhóm
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Chưa có chuyến đi nào</p>
            <p className="text-gray-400 text-sm mb-6">Tạo chuyến đi đầu tiên để bắt đầu</p>
            <Link href={`/trips/create?groupId=${groupId}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo chuyến đi
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/g/${groupSlug}/trips/${trip.id}`} className="block">
                <div className="p-5 border rounded-xl hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{trip.name}</h3>
                      {trip.destination && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {trip.destination}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Ngày bắt đầu</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {trip.startDate ? formatDate(trip.startDate) : 'Chưa xác định'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Ngày kết thúc</p>
                      <p className="font-semibold text-sm text-gray-900">
                        {trip.endDate ? formatDate(trip.endDate) : 'Chưa xác định'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        Thành viên
                      </p>
                      <p className="font-semibold text-sm text-gray-900">{trip.memberCount}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Tổng chi phí
                      </p>
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(trip.totalExpense, trip.currency)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
