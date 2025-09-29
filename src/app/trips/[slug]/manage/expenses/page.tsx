'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { getTripBySlug } from '@/lib/actions/trips';
import { getExpenses, getAdvances } from '@/lib/actions/expenses';
import { getTripMembers } from '@/lib/actions/trips';
import { Trip, Expense, Advance, TripMember } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ExpensesPage from '@/components/ExpensesPage';

export default function PersonalTripExpensesPage() {
  const params = useParams();
  const { user, loading } = useAuth();
  const tripSlug = params.slug as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (tripSlug && user) {
      loadData();
    }
  }, [tripSlug, user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const tripData = await getTripBySlug(tripSlug, undefined, user?.uid);
      if (!tripData) {
        toast.error('Không tìm thấy chuyến đi');
        return;
      }
      setTrip(tripData);
      
      // Load expenses, advances, and members
      console.log('🔄 Loading data for trip:', tripData.id);
      const [expensesData, advancesData, membersData] = await Promise.all([
        getExpenses(tripData.id),
        getAdvances(tripData.id),
        getTripMembers(tripData.id)
      ]);
      console.log('📊 Loaded expenses from server:', expensesData.length, 'expenses');
      console.log('🐛 First expense createdAt:', expensesData[0]?.createdAt, 'Type:', typeof expensesData[0]?.createdAt);
      setExpenses(expensesData);
      setAdvances(advancesData);
      setMembers(membersData);
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
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ExpensesPage
      trip={trip}
      expenses={expenses}
      advances={advances}
      members={members}
      backUrl={`/trips/${tripSlug}/manage`}
      backLabel="Quay lại quản lý chuyến đi"
      showAddButton={true}
      canEdit={true}
      canDelete={true}
    />
  );
}
