'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTripBySlug } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import TripViewPage from '@/components/TripViewPage';

export default function PersonalTripDetailPage() {
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
      console.log('Loading trip:', tripSlug, 'for user:', user?.uid);
      const tripData = await getTripBySlug(tripSlug, undefined, user?.uid);
      console.log('Trip loaded:', tripData);
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
      <div className="bg-main" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-main" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="container mx-auto px-4 py-6 max-w-7xl">
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
        <title>{trip.name} - Chi tiết chuyến đi | Budgo</title>
        <meta name="description" content={`Xem chi tiết chuyến đi ${trip.name}. Quản lý chi phí, thành viên và quyết toán cho chuyến đi của bạn.`} />
        <meta name="keywords" content="chuyến đi, quản lý chi phí, du lịch, budgo, trip management" />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${trip.name} - Chi tiết chuyến đi | Budgo`} />
        <meta property="og:description" content={`Xem chi tiết chuyến đi ${trip.name}. Quản lý chi phí, thành viên và quyết toán cho chuyến đi của bạn.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${trip.name} - Chi tiết chuyến đi | Budgo`} />
        <meta name="twitter:description" content={`Xem chi tiết chuyến đi ${trip.name}. Quản lý chi phí, thành viên và quyết toán cho chuyến đi của bạn.`} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
      </Head>
      
      <TripViewPage
        trip={trip}
        backUrl="/dashboard"
        backLabel="Về trang chủ"
      />
    </>
  );
}