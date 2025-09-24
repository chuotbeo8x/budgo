'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTripBySlug } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import TripManagePage from '@/components/TripManagePage';

export default function PersonalTripManagePage() {
  const params = useParams();
  const { user, loading } = useAuth();
  const tripSlug = params.slug as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(false);

  useEffect(() => {
    if (tripSlug && user) {
      loadTrip();
    }
  }, [tripSlug, user]);

  const loadTrip = async () => {
    try {
      setLoadingTrip(true);
      const tripData = await getTripBySlug(tripSlug, null, user?.uid);
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading trip:', error);
      if (error instanceof Error && error.message.includes('quyền truy cập')) {
        toast.error('Bạn không có quyền truy cập chuyến đi này');
      } else {
        toast.error('Có lỗi xảy ra khi tải thông tin chuyến đi');
      }
    } finally {
      setLoadingTrip(false);
    }
  };

  if (loading || loadingTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy chuyến đi</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TripManagePage
      trip={trip}
      backUrl="/dashboard"
      backLabel="Về trang chủ"
    />
  );
}