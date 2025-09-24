'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getTripMembers, isTripMember, updateMemberPaymentStatus } from '@/lib/actions/trips';
import { getExpenses, getAdvances } from '@/lib/actions/expenses';
import { calculateExpenseSplit } from '@/lib/actions/settlements';
import { Trip, TripMember, getTripTypeLabel, getTripTypeIcon, Expense, Advance } from '@/lib/types';
import { useSettlement } from '@/hooks/useSettlement';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import SettlementSummary from '@/components/SettlementSummary';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryName } from '@/lib/constants';
import TripStats from '@/components/TripStats';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Settings, 
  FileText, 
  Download,
  CreditCard,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Globe,
  Building,
  Plane,
  Car,
  Home,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Eye,
  BarChart3
} from 'lucide-react';

interface TripDetailPageProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripDetailPage({ trip, groupSlug, backUrl, backLabel }: TripDetailPageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [memberStats, setMemberStats] = useState<any[]>([]);
  
  // Use settlement hook for optimized calculations
  const { settlements } = useSettlement(expenses, advances, members);
  const { paymentStatus, loading: paymentStatusLoading } = usePaymentStatus(trip?.id, user?.uid);

  // Calculate expense categories
  const expenseCategories = expenses.reduce((acc, expense) => {
    const category = expense.category || 'other';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  useEffect(() => {
    if (trip && user) {
      checkMembership();
      loadMembers();
    }
  }, [trip, user]);

  const checkMembership = async () => {
    if (!trip || !user) return;
    
    try {
      // Always allow trip owner/creator to access
      if (user.uid === trip.ownerId) {
        setIsMember(true);
        return;
      }
      
      // Check if user is a trip member
      const member = await isTripMember(trip.id, user.uid);
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const loadMembers = async () => {
    if (!trip) return;
    
    try {
      console.log('Loading members for trip:', trip.id);
      const [membersData, expensesData, advancesData] = await Promise.all([
        getTripMembers(trip.id),
        getExpenses(trip.id),
        getAdvances(trip.id)
      ]);
      
      setMembers(membersData);
      setExpenses(expensesData);
      setAdvances(advancesData);
    } catch (error) {
      console.error('Error loading trip data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu chuyến đi');
    }
  };

  const handlePaymentStatusUpdate = async (memberId: string, status: 'paid' | 'unpaid') => {
    if (!trip || !user) return;
    
    try {
      await updateMemberPaymentStatus(trip.id, memberId, status, user.uid);
      toast.success(`Cập nhật trạng thái thanh toán thành công`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy chuyến đi</h1>
            <Link href={backUrl}>
              <Button>{backLabel}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
            <p className="text-muted-foreground mb-4">Bạn không phải là thành viên của chuyến đi này</p>
            <Link href={backUrl}>
              <Button>{backLabel}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === trip.ownerId;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvance = advances.reduce((sum, advance) => sum + advance.amount, 0);

  // Build URLs based on context
  const expensesUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/expenses` : `/trips/${trip.slug}/expenses`;
  const membersUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/members` : `/trips/${trip.slug}/members`;
  const manageUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/manage` : `/trips/${trip.slug}/manage`;
  const exportUrl = groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/export` : `/trips/${trip.slug}/export`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-2xl shadow-md">
            {trip.coverUrl ? (
              <div className="relative h-52 md:h-64">
                <img
                  src={trip.coverUrl}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            ) : (
              <div className="h-52 md:h-64 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500" />
            )}

            <div className="absolute inset-0">
              {/* Removed compact type icon: main trip icon below communicates context */}

              {/* Main hero content: icon left -> name, description */}
              <div className="h-full w-full flex items-center justify-start px-6 md:px-10">
                <div className="flex items-center gap-4 md:gap-5 text-white max-w-5xl">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white text-gray-900 rounded-xl flex items-center justify-center shadow-lg border border-white/70">
                    <span className="text-2xl md:text-3xl">{getTripTypeIcon(trip)}</span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-4xl font-bold drop-shadow truncate">
                      {trip.name}
                    </h1>
                    {trip.description && (
                      <p className="mt-1 md:mt-2 text-sm md:text-base text-white/90 line-clamp-2">
                        {trip.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tổng chi phí</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpense, trip.currency)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tạm ứng</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAdvance, trip.currency)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Thành viên</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Còn lại</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAdvance - totalExpense, trip.currency)}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trip Details */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Thông tin chuyến đi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Điểm đến</p>
                    <p className="font-medium">{trip.destination || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-medium">
                      {trip.startDate ? formatDate(trip.startDate) : 'Chưa xác định'} - {trip.endDate ? formatDate(trip.endDate) : 'Chưa xác định'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số thành viên</p>
                    <p className="font-medium">{members.length} người</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Tiền tệ</p>
                    <p className="font-medium">{trip.currency}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Share Trip Link */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Chia sẻ liên kết chuyến đi</p>
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <input
                  readOnly
                  value={(typeof window !== 'undefined') ? `${window.location.origin}${groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`}` : ''}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700"
                />
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const url = `${window.location.origin}${groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`}`;
                      await navigator.clipboard.writeText(url);
                      toast.success('Đã sao chép liên kết chuyến đi');
                    } catch (e) {
                      toast.error('Không thể sao chép liên kết');
                    }
                  }}
                >
                  Sao chép link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Link href={expensesUrl}>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Chi phí & Tạm ứng
            </Button>
          </Link>
          
          <Link href={membersUrl}>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Thành viên
            </Button>
          </Link>
          
          {isOwner && (
            <Link href={manageUrl}>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Quản lý
              </Button>
            </Link>
          )}
          
          <Link href={exportUrl}>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </Link>
        </div>

        {/* Expenses and Advances Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Expense Categories */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Chi phí theo danh mục
              </CardTitle>
              <Link href={expensesUrl}>
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {Object.keys(expenseCategories).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có chi phí nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    // Group categories by display name to merge duplicates
                    const groupedCategories: { [key: string]: number } = {};
                    
                    Object.entries(expenseCategories).forEach(([category, amount]) => {
                      const displayName = getCategoryName(category);
                      groupedCategories[displayName] = (groupedCategories[displayName] || 0) + amount;
                    });
                    
                    return Object.entries(groupedCategories)
                      .sort(([,a], [,b]) => b - a)
                      .map(([displayName, amount]) => (
                        <div key={displayName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{displayName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-600">
                              {formatCurrency(amount, trip.currency)}
                            </p>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Recent Expenses */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Chi phí gần đây
              </CardTitle>
              <Link href={expensesUrl}>
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có chi phí nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => {
                    const paidByMember = members.find(m => m.id === expense.paidBy);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                          <p className="text-sm text-gray-500">
                            {paidByMember?.name} • {formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(expense.amount, trip.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {expenses.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        và {expenses.length - 5} chi phí khác...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Recent Advances */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Tạm ứng gần đây
              </CardTitle>
              <Link href={expensesUrl}>
                <Button variant="outline" size="sm">
                  Xem tất cả
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {advances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có tạm ứng nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {advances.slice(0, 5).map((advance) => {
                    const paidByMember = members.find(m => m.id === advance.paidBy);
                    return (
                      <div key={advance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{advance.description}</p>
                          <p className="text-sm text-gray-500">
                            {paidByMember?.name} • {formatDate(advance.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(advance.amount, trip.currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {advances.length > 5 && (
                    <div className="text-center pt-2">
                      <p className="text-sm text-gray-500">
                        và {advances.length - 5} tạm ứng khác...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settlement Summary */}
        <SettlementSummary 
          settlements={settlements}
          currency={trip.currency}
          showDetails={true}
          showToggle={false}
          isOwner={isOwner}
          paymentStatus={paymentStatus}
          loading={paymentStatusLoading}
        />
      </div>
    </div>
  );
}
