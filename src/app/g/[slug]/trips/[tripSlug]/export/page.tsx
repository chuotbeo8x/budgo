'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTripBySlug } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ExportPage from '@/components/ExportPage';

export default function GroupTripExportPage() {
  const params = useParams();
  const { user, loading } = useAuth();
  const groupSlug = params.slug as string;
  const tripSlug = params.tripSlug as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (groupSlug && tripSlug && user) {
      loadData();
    }
  }, [groupSlug, tripSlug, user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const tripData = await getTripBySlug(tripSlug, groupSlug, user?.uid);
      if (!tripData) {
        toast.error('Không tìm thấy chuyến đi');
        return;
      }
      setTrip(tripData);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error instanceof Error && error.message.includes('quyền truy cập')) {
        toast.error('Bạn không có quyền truy cập chuyến đi này');
      } else {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      }
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chuyến đi không tồn tại
          </h1>
          <Link href={`/g/${groupSlug}/trips/${tripSlug}`}>
            <Button>Quay lại chuyến đi</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ExportPage
      trip={trip}
      backUrl={`/g/${groupSlug}/trips/${tripSlug}`}
      backLabel="Quay lại chuyến đi"
      canExport={true}
    />
  );
}


