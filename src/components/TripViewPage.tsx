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
import TripStats from '@/components/TripStats';
import ExpensesInline from '@/components/ExpensesInline';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle,
  AlertCircle,
  Globe,
  DollarSign,
  Building,
  Plane,
  Car,
  Home,
  Eye,
  Share2,
  BarChart3
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
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <div className="text-center">Đang tải thông tin chuyến đi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-6">
          <Link href={backUrl}>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        </div>

        {/* Trip Status Banner - Compact */}
        {isTripClosed && (
          <div className="mb-4">
            <TripStatusAlerts.closed />
          </div>
        )}

        {/* All-in-One Overview Card */}
        <Card className="overflow-hidden p-0">
          {/* Cover Image Background */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-blue-500 to-purple-600">
            {trip.coverImage ? (
              <>
                <img 
                  src={trip.coverImage} 
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="text-2xl sm:text-3xl font-bold mb-1">{trip.name}</div>
                  <div className="text-sm opacity-90">{getTripTypeLabel(trip)}</div>
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="space-y-4 relative">
            {/* Trip Info - Compact */}
            <div className="space-y-3">
              {/* Basic Info - No duplicate trip name */}
              <div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {getTripTypeIconComponent()}
                    <span>{getTripTypeLabel(trip)}</span>
                  </div>
                  {trip.destination && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{trip.destination}</span>
                      </div>
                    </>
                  )}
                  {(trip.startDate || trip.endDate) && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {trip.startDate && trip.endDate 
                            ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                            : trip.startDate 
                              ? `Từ ${formatDate(trip.startDate)}`
                              : `Đến ${formatDate(trip.endDate)}`
                          }
                        </span>
                      </div>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span>{trip.currency}</span>
                  {trip.costPerPersonPlanned && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{formatCurrency(trip.costPerPersonPlanned, trip.currency)}/người</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {trip.description && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {trip.description}
                </div>
              )}

              {/* Share Link */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-700 font-medium mb-1">Link chia sẻ chuyến đi</p>
                    <p className="text-sm text-blue-900 truncate">
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
                    className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 pb-4">
              {/* Tabs for Settlement, Expenses and Members */}
              <Tabs defaultValue="settlement" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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
                    <span className="hidden sm:inline">Chi phí</span>
                    <span className="sm:hidden">CP</span>
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded-full">
                      {expenses.length + advances.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="text-xs sm:text-sm">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Thành viên</span>
                    <span className="sm:hidden">TV</span>
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded-full">
                      {members.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="settlement" className="mt-3">
                  {settlements && settlements.length > 0 && trip?.id ? (
                    <SettlementSummary 
                      settlements={settlements}
                      currency={trip.currency}
                      tripId={trip.id}
                      paymentStatus={paymentStatus}
                      isOwner={false}
                      showToggle={false}
                      userId={user?.uid}
                    />
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Chưa có quyết toán
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="expenses" className="mt-3">
                  <ExpensesInline 
                    trip={trip}
                    expenses={expenses}
                    advances={advances}
                    members={members}
                    showAddButton={false}
                    canEdit={false}
                    canDelete={false}
                  />
                </TabsContent>
                
                <TabsContent value="members" className="mt-3">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name || member.ghostName || 'User'} 
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium ${member.avatar ? 'hidden' : 'flex'}`}
                          >
                            {(member.name || member.ghostName || member.userId || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium">
                            {member.userId === user?.uid ? 'Bạn' : (member.name || member.ghostName || (member.userId ? `User ${member.userId.slice(0, 8)}` : 'Unknown User'))}
                          </span>
                          <span className="text-gray-500">
                            {member.role === 'owner' ? '(Chủ)' : '(Thành viên)'}
                          </span>
                        </div>
                        {paymentStatus && paymentStatus[member.id] && (
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}