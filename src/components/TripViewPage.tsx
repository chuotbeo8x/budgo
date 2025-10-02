'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { TripStatusAlerts } from '@/components/ui/AlertMessage';
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
import Footer from '@/components/Footer';
import TripStats from '@/components/TripStats';
import TimelineView from '@/components/TimelineView';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Globe,
  DollarSign,
  CreditCard,
  Building,
  Plane,
  Car,
  Home,
  Eye,
  Share2,
  BarChart3,
  Calculator,
  Copy
} from 'lucide-react';

interface TripViewPageProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripViewPage({ trip, groupSlug, backUrl, backLabel }: TripViewPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());
  const [expandedAdvances, setExpandedAdvances] = useState<Set<string>>(new Set());

  const { settlements } = useSettlement(expenses, advances, members);
  const { paymentStatus: hookPaymentStatus, loadPaymentStatus } = usePaymentStatus(trip?.id || '', user?.uid);
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});

  // Sync paymentStatus with hook data
  useEffect(() => {
    console.log('🎯 TripViewPage - hookPaymentStatus received:', hookPaymentStatus);
    setPaymentStatus(hookPaymentStatus || {});
    console.log('🎯 TripViewPage - paymentStatus state updated:', hookPaymentStatus || {});
  }, [hookPaymentStatus]);

  useEffect(() => {
    if (user) {
      console.log('🔄 TripViewPage useEffect - user:', user.uid, 'tripId:', trip.id);
      loadData();
      checkMembership();
      loadPaymentStatus(); // Load payment status when component mounts
    }
  }, [user, trip.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, expensesData, advancesData] = await Promise.all([
        getTripMembers(trip.id),
        getExpenses(trip.id),
        getAdvances(trip.id)
      ]);
      setMembers(membersData);
      setExpenses(expensesData);
      setAdvances(advancesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user) return;
    try {
      const memberCheck = await isTripMember(trip.id, user.uid);
      setIsMember(memberCheck);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  // TimelineView handlers
  const toggleExpense = (id: string) => {
    setExpandedExpenses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAdvance = (id: string) => {
    setExpandedAdvances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };


  const isTripClosed = trip.status === 'closed';
  const canManage = user?.uid === trip.ownerId || isMember;

  // Calculate totals
  const totalExpenses = expenses && Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + expense.amount, 0) : 0;
  const totalAdvances = advances && Array.isArray(advances) ? advances.reduce((sum, advance) => sum + advance.amount, 0) : 0;
  const netBalance = totalExpenses - totalAdvances;

  // Get trip type icon
  const getTripTypeIconComponent = () => {
    const iconClass = "w-5 h-5";
    const tripType = trip?.type || 'default';
    switch (tripType) {
      case 'international':
        return <Globe className={iconClass} />;
      case 'business':
        return <Building className={iconClass} />;
      case 'leisure':
        return <Plane className={iconClass} />;
      case 'road_trip':
        return <Car className={iconClass} />;
      case 'local':
        return <Home className={iconClass} />;
      default:
        return <MapPin className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-main min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <div className="text-center">Đang tải thông tin chuyến đi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main min-h-screen">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <Link href={backUrl}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        </header>

        {/* Trip Status Banner */}
        {isTripClosed && (
          <div className="mb-4 lg:mb-6">
            <TripStatusAlerts.closed />
          </div>
        )}

        {/* Main Content */}
        <main role="main" aria-label="Chi tiết chuyến đi">
          <Card className="overflow-hidden p-0 rounded-lg shadow-sm border border-gray-200">
          {/* Cover Image Background */}
          <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
            {trip.coverImage ? (
              <>
                <img 
                  src={trip.coverImage} 
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            )}
            
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-end p-6">
              <div className="w-full">
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      {getTripTypeIcon(trip)}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                      {trip.name}
                    </h1>
                  </div>
                  {trip.description && (
                    <p className="text-white/90 text-sm sm:text-base max-w-2xl leading-relaxed">
                      {trip.description}
                    </p>
            )}
          </div>
          
                {/* Trip Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(trip.startDate)}</span>
                    {trip.endDate && trip.endDate !== trip.startDate && (
                      <>
                        <span>→</span>
                        <span>{formatDate(trip.endDate)}</span>
                    </>
                  )}
                  </div>
                  
                  {trip.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.location}</span>
                      </div>
                  )}
                  
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                  <span>{trip.currency}</span>
                  {trip.costPerPersonPlanned && (
                    <>
                        <span>•</span>
                      <span>{formatCurrency(trip.costPerPersonPlanned, trip.currency)}/người</span>
                    </>
                  )}
                </div>
              </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-4 lg:p-6 space-y-4 lg:space-y-6 relative">
            {/* Trip Info */}
            <section className="space-y-4 lg:space-y-6" aria-label="Thông tin chuyến đi">


              {/* Share Link */}
              <div className="bg-main border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 font-medium mb-1">Chia sẻ chuyến đi</p>
                    <p className="text-sm text-gray-800 truncate font-mono">
                      {typeof window !== 'undefined' ? window.location.href : ''}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Đã copy link!');
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 pb-4">
              {/* Tabs for Settlement, Expenses and Members */}
              <Tabs defaultValue="settlement" className="w-full" role="tablist" aria-label="Nội dung chuyến đi">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="settlement" className="text-xs sm:text-sm" disabled={!settlements || settlements.length === 0}>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Quyết toán</span>
                    <span className="sm:hidden">QT</span>
                    {settlements && settlements.length > 0 && (
                      <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded-full">
                        {settlements.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="expenses" className="text-xs sm:text-sm">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Chi phí & Tạm ứng</span>
                    <span className="sm:hidden">CP</span>
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded-full">
                      {expenses.length + advances.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="settlement" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="settlement-tab">
                  {settlements && settlements.length > 0 && trip?.id ? (
                    <div className="space-y-4">
                      {/* Header with Summary */}
                      <Card className="p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                          {/* Header Text */}
                          <div className="flex-1">
                            <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Quyết toán chuyến đi</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              Tổng quan về chi phí và thanh toán giữa các thành viên
                            </p>
                          </div>
                          
                          {/* Visual Separator - Hidden on mobile */}
                          <div className="hidden lg:block w-px h-16 bg-gray-300"></div>
                          
                          {/* Compact Summary Stats */}
                          <div className="flex-1 space-y-1">
                            {/* Cần trả */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-xs font-semibold text-red-800">Cần trả</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="text-sm font-bold text-red-600">
                                  {formatCurrency(
                                    settlements
                                      .filter(s => s.balance < -0.01 && !paymentStatus[s.memberId])
                                      .reduce((sum, s) => sum + Math.abs(s.balance), 0), 
                                    trip.currency
                                  )}
                                </div>
                                <div className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                                  {settlements.filter(s => s.balance < -0.01 && !paymentStatus[s.memberId]).length} người
                                </div>
                              </div>
                            </div>

                            {/* Sẽ nhận */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-800">Sẽ nhận</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="text-sm font-bold text-green-600">
                                  {formatCurrency(
                                    settlements
                                      .filter(s => s.balance > 0.01 && !paymentStatus[s.memberId])
                                      .reduce((sum, s) => sum + s.balance, 0), 
                                    trip.currency
                                  )}
                                </div>
                                <div className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                  {settlements.filter(s => s.balance > 0.01 && !paymentStatus[s.memberId]).length} người
                                </div>
                              </div>
                            </div>

                            {/* Đã hoàn thành */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-800">Hoàn thành</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="text-sm font-bold text-blue-600">
                                  {settlements.filter(s => paymentStatus[s.memberId]).length}
                                </div>
                                <div className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                  / {settlements.length} thành viên
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Settlement List */}
                      <div className="space-y-2">
                        {settlements.map((settlement) => {
                          const isPositive = settlement.balance > 0;
                          const isNegative = settlement.balance < 0;
                          const isZero = Math.abs(settlement.balance) < 0.01;
                          const isPaid = paymentStatus[settlement.memberId];
                          const isCompleted = isPaid || (isZero && isPositive);
                          
                          return (
                            <div key={settlement.memberId} className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                              isCompleted
                                ? 'bg-main border-l-gray-400' 
                                : isZero
                                  ? 'bg-purple-50 border-l-purple-500'
                                  : isPositive
                                    ? 'bg-green-50 border-l-green-500 hover:bg-green-100'
                                    : 'bg-red-50 border-l-red-500 hover:bg-red-100'
                            }`}>
                              <div className="flex items-center justify-between">
                                {/* Member Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${
                                      isCompleted ? 'text-gray-600 line-through italic' : 'text-gray-900'
                                    }`}>
                                      {settlement.memberName}
                                    </h4>
                                    {isPaid ? (
                                      <div className="flex items-center gap-1 text-gray-500">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="text-xs line-through italic">Đã thanh toán</span>
                                      </div>
                                    ) : isCompleted ? (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="line-through italic">Đã hoàn thành</span>
                                      </div>
                                    ) : (
                                      <div className={`flex items-center gap-1 text-xs ${
                                        isZero ? 'text-purple-600' : 
                                        isPositive ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        <AlertCircle className="w-3 h-3" />
                                        <span>
                                          {isZero ? 'Cân bằng' : 
                                           isPositive ? 'Chưa nhận' : 'Chưa trả'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className={`flex items-center gap-4 mt-1 text-xs ${
                                    isCompleted ? 'text-gray-500' : 'text-gray-600'
                                  }`}>
                                    <span className={`${isCompleted ? 'text-gray-500 line-through italic' : 'text-red-600'}`}>
                                      Chi: {formatCurrency(settlement.totalExpenses, trip.currency)}
                                    </span>
                                    <span className={`${isCompleted ? 'text-gray-500 line-through italic' : 'text-blue-600'}`}>
                                      Ứng: {formatCurrency(settlement.totalAdvances, trip.currency)}
                                    </span>
                                  </div>
                                </div>

                                {/* Balance */}
                                <div className="text-right">
                                  <div className={`text-lg font-bold ${
                                    isCompleted ? 'text-gray-500 line-through italic' :
                                    isZero ? 'text-purple-600' : 
                                    isPositive ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {formatCurrency(settlement.balance, trip.currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có quyết toán</h3>
                      <p className="text-sm text-gray-500">Thêm chi phí và tạm ứng để xem quyết toán</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="expenses" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="expenses-tab">
                  <TimelineView
                    expenses={expenses}
                    advances={advances}
                    members={members}
                    trip={trip}
                    expandedExpenses={expandedExpenses}
                    expandedAdvances={expandedAdvances}
                    toggleExpense={toggleExpense}
                    toggleAdvance={toggleAdvance}
                    handleEditExpense={() => {}}
                    handleDeleteExpense={() => {}}
                    setEditingAdvance={() => {}}
                    handleDeleteAdvance={() => {}}
                    canEdit={false}
                    isTripClosed={isTripClosed}
                    getCategoryIcon={(category: string) => {
                      const categoryIcons: { [key: string]: any } = {
                        'food': '🍽️',
                        'transport': '🚗',
                        'accommodation': '🏠',
                        'entertainment': '🎮',
                        'shopping': '🛍️',
                        'other': '🏷️',
                      };
                      return categoryIcons[category] || '🏷️';
                    }}
                    getCategoryLabel={(category: string) => {
                      const categoryLabels: { [key: string]: string } = {
                        'food': 'Ăn uống',
                        'transport': 'Di chuyển',
                        'accommodation': 'Lưu trú',
                        'entertainment': 'Giải trí',
                        'shopping': 'Mua sắm',
                        'other': 'Khác',
                      };
                      return categoryLabels[category] || 'Khác';
                    }}
                  />
                </TabsContent>
                
              </Tabs>
            </div>
          </CardContent>
        </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}