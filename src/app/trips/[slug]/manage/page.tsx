'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTripBySlug } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import TripManagePageWithTabs from '@/components/TripManagePageWithTabs';
import Head from 'next/head';

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
      const tripData = await getTripBySlug(tripSlug, undefined, user?.uid);
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
    <>
      <Head>
        <title>Quản lý {trip.name} | Budgo</title>
        <meta name="description" content={`Quản lý chuyến đi ${trip.name}. Chỉnh sửa thông tin, quản lý thành viên, chi phí và quyết toán.`} />
        <meta name="keywords" content="quản lý chuyến đi, trip management, budgo, quản lý chi phí" />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`Quản lý ${trip.name} | Budgo`} />
        <meta property="og:description" content={`Quản lý chuyến đi ${trip.name}. Chỉnh sửa thông tin, quản lý thành viên, chi phí và quyết toán.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`Quản lý ${trip.name} | Budgo`} />
        <meta name="twitter:description" content={`Quản lý chuyến đi ${trip.name}. Chỉnh sửa thông tin, quản lý thành viên, chi phí và quyết toán.`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
      </Head>
      
      <TripManagePageWithTabs
        trip={trip}
        backUrl="/dashboard"
        backLabel="Về trang chủ"
      />
    </>
  );
}