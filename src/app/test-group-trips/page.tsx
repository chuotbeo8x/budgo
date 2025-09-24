'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getGroupTrips } from '@/lib/actions/trips';
import { formatDate } from '@/lib/utils/date';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

export default function TestGroupTripsPage() {
  const { user, loading } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [error, setError] = useState('');

  const loadTrips = async () => {
    if (!groupId.trim()) {
      setError('Vui lòng nhập Group ID');
      return;
    }

    try {
      setLoadingTrips(true);
      setError('');
      console.log('Loading trips for group:', groupId);
      const tripsData = await getGroupTrips(groupId);
      console.log('Loaded trips:', tripsData);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoadingTrips(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
    }).format(amount);
  };

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
        return 'Sắp diễn ra';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Vui lòng đăng nhập để sử dụng tính năng này</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Group Trips Function</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupId">Group ID:</Label>
              <Input
                id="groupId"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Nhập Group ID để test..."
                className="mt-2"
              />
            </div>
            <Button onClick={loadTrips} disabled={loadingTrips || !groupId.trim()}>
              {loadingTrips ? 'Đang tải...' : 'Tải chuyến đi'}
            </Button>
            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {trips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả ({trips.length} chuyến đi)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{trip.name}</h3>
                      {trip.destination && (
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trip.destination}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                        {formatCurrency(trip.totalExpense || 0, trip.currency)}
                      </p>
                    </div>
                  </div>
                  
                  {trip.description && (
                    <div className="mt-4">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Mô tả</p>
                      <p className="text-sm text-gray-700">{trip.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-gray-400">
                    <p>Tạo lúc: {formatDate(trip.createdAt)}</p>
                    <p>ID: {trip.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {trips.length === 0 && !loadingTrips && groupId && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có chuyến đi nào</h3>
              <p className="text-gray-500">Nhóm này chưa có chuyến đi nào được tạo.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


