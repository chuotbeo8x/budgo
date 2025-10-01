'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/simple-select';
import { updateTrip, deleteTrip, closeTrip } from '@/lib/actions/trips';
import { toDate } from '@/lib/utils/date';
import { Trip, TripMember, Expense, Advance } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, AlertTriangle, Edit, X, Calendar, MapPin, Users, DollarSign, CreditCard, FileText, Download, Eye, Settings, Menu } from 'lucide-react';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TripStatusAlerts } from '@/components/ui/AlertMessage';
import { getTripMembers, updateMemberPaymentStatus, getTripPaymentStatus } from '@/lib/actions/trips';
import { getExpenses, getAdvances } from '@/lib/actions/expenses';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { useSettlement } from '@/hooks/useSettlement';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import SettlementSummary from '@/components/SettlementSummary';
import TripStats from '@/components/TripStats';
import ExpensesInline from '@/components/ExpensesInline';
import MembersInline from '@/components/MembersInline';

interface TripManagePageWithTabsProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripManagePageWithTabs({ trip, groupSlug, backUrl, backLabel }: TripManagePageWithTabsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('expenses');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settlements } = useSettlement(expenses, advances, members);
  const { paymentStatus: hookPaymentStatuses, updatePaymentStatus, updating, loading: paymentStatusLoading } = usePaymentStatus(trip?.id || '', user?.uid);

  // Sync paymentStatuses with hook data
  useEffect(() => {
    setPaymentStatuses(hookPaymentStatuses || {});
  }, [hookPaymentStatuses]);



  const safeDateInput = (value: any): string => {
    try {
      const d = toDate(value);
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: trip.name || '',
    description: trip.description || '',
    startDate: safeDateInput(trip.startDate),
    endDate: safeDateInput(trip.endDate),
    destination: trip.destination || '',
    coverUrl: trip.coverUrl || '',
    currency: trip.currency || 'VND',
    costPerPersonPlanned: trip.costPerPersonPlanned ? trip.costPerPersonPlanned.toString() : '',
  });

  useEffect(() => {
    if (user) {
      loadData();
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
      
      
      setMembers(membersData || []);
      setExpenses(expensesData || []);
      setAdvances(advancesData || []);
    } catch (error) {
      console.error('Error loading trip data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      const updateData = {
        ...formData,
        costPerPersonPlanned: formData.costPerPersonPlanned ? parseFloat(formData.costPerPersonPlanned) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      await updateTrip(trip.id, updateData, user.uid);
      toast.success('Cập nhật thông tin chuyến đi thành công');
      setEditing(false);
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Có lỗi xảy ra khi cập nhật chuyến đi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: trip.name || '',
      description: trip.description || '',
      startDate: safeDateInput(trip.startDate),
      endDate: safeDateInput(trip.endDate),
      destination: trip.destination || '',
      coverUrl: trip.coverUrl || '',
      currency: trip.currency || 'VND',
      costPerPersonPlanned: trip.costPerPersonPlanned ? trip.costPerPersonPlanned.toString() : '',
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await deleteTrip(trip.id, user.uid);
      toast.success('Đã xóa chuyến đi');
      router.push(backUrl);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Có lỗi xảy ra khi xóa chuyến đi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTrip = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await closeTrip(trip.id, user.uid);
      toast.success('Đã lưu trữ chuyến đi');
      router.refresh();
    } catch (error) {
      console.error('Error closing trip:', error);
      toast.error('Có lỗi xảy ra khi lưu trữ chuyến đi');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentStatusUpdate = async (memberId: string, paid: boolean) => {
    if (!user) return;
    try {
      await updatePaymentStatus(memberId, paid);
      toast.success(paid ? 'Đã đánh dấu đã thanh toán' : 'Đã đánh dấu chưa thanh toán');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
    }
  };

  const isTripClosed = trip.status === 'closed';
  const canManage = user?.uid === trip.ownerId;
  
  // Debug logging
  console.log('🔍 TripManagePageWithTabs - Debug canManage:', {
    userUid: user?.uid,
    tripOwnerId: trip.ownerId,
    canManage,
    tripId: trip.id,
    fullTrip: trip
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);
  const netBalance = totalExpenses - totalAdvances;

  // Tab Content Components
  const TripInfoTab = () => (
    <div className="space-y-4 lg:space-y-6">
      <Card className="rounded-lg shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Edit className="w-5 h-5 text-primary-600" />
            Thông tin chuyến đi
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Chỉnh sửa thông tin cơ bản của chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên chuyến đi *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                placeholder="Nhập tên chuyến đi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                rows={3}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                placeholder="Nhập mô tả chuyến đi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-sm font-medium text-gray-700">Địa điểm</Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                placeholder="Nhập địa điểm"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Ngày bắt đầu</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={!editing || isTripClosed}
                  className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">Ngày kết thúc</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={!editing || isTripClosed}
                  className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Tiền tệ</Label>
                <Select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                  disabled={!editing || isTripClosed}
                  options={[
                    { value: 'VND', label: 'VND' },
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerPersonPlanned" className="text-sm font-medium text-gray-700">Chi phí dự kiến/người</Label>
                <Input
                  id="costPerPersonPlanned"
                  name="costPerPersonPlanned"
                  type="number"
                  value={formData.costPerPersonPlanned}
                  onChange={handleInputChange}
                  disabled={!editing || isTripClosed}
                  className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                  placeholder="Nhập chi phí dự kiến"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverUrl" className="text-sm font-medium text-gray-700">URL ảnh bìa</Label>
              <Input
                id="coverUrl"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {!editing ? (
              <Button
                type="button"
                onClick={() => setEditing(true)}
                disabled={isTripClosed}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isTripClosed ? 'Chuyến đi đã đóng' : 'Chỉnh sửa thông tin'}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                  variant="default"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>


      {/* Trip Actions */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Hành động chuyến đi
            </CardTitle>
            <CardDescription>
              Các hành động quan trọng cho chuyến đi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isTripClosed && (
              <DeleteConfirmDialog
                trigger={
                  <Button
                    disabled={submitting}
                    variant="outline"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {submitting ? 'Đang lưu trữ...' : 'Lưu trữ chuyến đi'}
                  </Button>
                }
                title="Lưu trữ chuyến đi"
                description="Bạn có chắc chắn muốn lưu trữ chuyến đi này? Sau khi lưu trữ, không thể thêm, sửa hoặc xóa chi phí và tạm ứng."
                confirmText="Lưu trữ"
                cancelText="Hủy"
                onConfirm={handleCloseTrip}
                loadingText="Đang lưu trữ..."
              />
            )}

            <DeleteConfirmDialog
              trigger={
                <Button
                  disabled={submitting}
                  variant="outline"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {submitting ? 'Đang xóa...' : 'Xóa chuyến đi'}
                </Button>
              }
              title="Xóa chuyến đi"
              description="Bạn có chắc chắn muốn xóa chuyến đi này? Hành động này không thể hoàn tác."
              confirmText="Xóa"
              cancelText="Hủy"
              onConfirm={handleDelete}
              loadingText="Đang xóa..."
            />
          </CardContent>
        </Card>
      )}

      {/* Warning for closing trip */}
      {!isTripClosed && (
        <TripStatusAlerts.warningForClosing />
      )}
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-4">
      <MembersInline 
        trip={trip}
        members={members}
        showAddButton={!isTripClosed}
        canEdit={!isTripClosed}
        canDelete={!isTripClosed}
        canInvite={!isTripClosed}
        onMemberAdded={() => {
          router.refresh();
        }}
        onMemberUpdated={() => {
          router.refresh();
        }}
        onMemberDeleted={() => {
          router.refresh();
        }}
      />

      {/* Quick Stats */}
      <TripStats 
        trip={trip}
        expenses={expenses}
        advances={advances}
        members={members}
      />
    </div>
  );

  const ExpensesTab = () => (
    <div className="space-y-4">
      <ExpensesInline 
        trip={trip}
        expenses={expenses}
        advances={advances}
        members={members}
        showAddButton={!isTripClosed}
        canEdit={!isTripClosed}
        canDelete={!isTripClosed}
        onExpenseAdded={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
        onExpenseUpdated={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
        onExpenseDeleted={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
        onAdvanceAdded={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
        onAdvanceUpdated={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
        onAdvanceDeleted={() => {
          // Refresh trip data to update statsCache display
          router.refresh();
        }}
      />
    </div>
  );

  const SettlementTab = () => (
    <div className="space-y-4">
      {settlements && settlements.length > 0 ? (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <FileText className="w-4 h-4 text-green-600" />
              Quyết toán chi phí
            </CardTitle>
            <CardDescription className="text-sm">
              Quản lý trạng thái thanh toán của các thành viên
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {trip?.id && (
              <SettlementSummary 
                settlements={settlements}
                currency={trip.currency}
                tripId={trip.id}
                isOwner={canManage}
                showToggle={true}
                userId={user?.uid}
                paymentStatus={hookPaymentStatuses}
                onPaymentStatusChange={handlePaymentStatusUpdate}
              />
            )}
            {/* Debug logging */}
            {console.log('🔍 TripManagePageWithTabs - trip.id:', trip.id)}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>Chưa có dữ liệu quyết toán</p>
            <p className="text-sm">Thêm chi phí và tạm ứng để xem quyết toán</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Download className="w-4 h-4 text-orange-600" />
            Báo cáo và xuất dữ liệu
          </CardTitle>
          <CardDescription className="text-sm">
            Xuất báo cáo chi tiết và dữ liệu chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Xuất báo cáo tổng hợp chi phí và quyết toán
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/export` : `/trips/${trip.slug}/export`}>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="w-4 h-4 text-green-600" />
            Chi tiết quyết toán
          </CardTitle>
          <CardDescription className="text-sm">
            Xem chi tiết báo cáo quyết toán
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Xem báo cáo quyết toán chi tiết
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/settlement` : `/trips/${trip.slug}/settlement`}>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Xem chi tiết quyết toán
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );


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
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-6 lg:mb-8">
          <Link href={backUrl}>
            <Button variant="outline" size="sm">
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

        {/* Main Management Container */}
        <main role="main" aria-label="Quản lý chuyến đi">
          <Card className="overflow-hidden rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-0">
              {/* Header */}
              <div className="px-4 lg:px-6 py-4 border-b bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Settings className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                          Quản lý chuyến đi
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">{trip.name}</span>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            {trip.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Xem thông tin</span>
                        <span className="sm:hidden">Xem</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden p-3 border-b">
              <Button
                variant="outline"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span>Menu quản lý</span>
                <Menu className="w-4 h-4" />
              </Button>
              
              {mobileMenuOpen && (
                <div className="mt-2 space-y-2">
                  <Button
                    variant={activeTab === 'expenses' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('expenses');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Chi phí
                  </Button>
                  <Button
                    variant={activeTab === 'members' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('members');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Thành viên
                  </Button>
                  <Button
                    variant={activeTab === 'settlement' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('settlement');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Quyết toán
                  </Button>
                  <Button
                    variant={activeTab === 'reports' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('reports');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Báo cáo
                  </Button>
                  <Button
                    variant={activeTab === 'info' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('info');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Thông tin
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:block">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" role="tablist" aria-label="Quản lý chuyến đi">
                <TabsList className="grid grid-cols-5 mx-4 lg:mx-6 mt-4 lg:mt-6 mb-0">
                  <TabsTrigger value="expenses" className="flex items-center justify-center gap-2 text-sm px-3 py-2" role="tab" aria-selected={activeTab === 'expenses'}>
                    <DollarSign className="w-4 h-4" />
                    <span>Chi phí</span>
                  </TabsTrigger>
                  <TabsTrigger value="members" className="flex items-center justify-center gap-2 text-sm px-3 py-2" role="tab" aria-selected={activeTab === 'members'}>
                    <Users className="w-4 h-4" />
                    <span>Thành viên</span>
                  </TabsTrigger>
                  <TabsTrigger value="settlement" className="flex items-center justify-center gap-2 text-sm px-3 py-2" role="tab" aria-selected={activeTab === 'settlement'}>
                    <FileText className="w-4 h-4" />
                    <span>Quyết toán</span>
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex items-center justify-center gap-2 text-sm px-3 py-2" role="tab" aria-selected={activeTab === 'reports'}>
                    <Download className="w-4 h-4" />
                    <span>Báo cáo</span>
                  </TabsTrigger>
                  <TabsTrigger value="info" className="flex items-center justify-center gap-2 text-sm px-3 py-2" role="tab" aria-selected={activeTab === 'info'}>
                    <Edit className="w-4 h-4" />
                    <span>Thông tin</span>
                  </TabsTrigger>
                </TabsList>
            
                <TabsContent value="expenses" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="expenses-tab">
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <ExpensesTab />
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="members-tab">
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <MembersTab />
                  </div>
                </TabsContent>

                <TabsContent value="settlement" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="settlement-tab">
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <SettlementTab />
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="reports-tab">
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <ReportsTab />
                  </div>
                </TabsContent>

                <TabsContent value="info" className="mt-4 lg:mt-6" role="tabpanel" aria-labelledby="info-tab">
                  <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                    <TripInfoTab />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Content */}
            <div className="lg:hidden">
              <div className="px-4 pb-4">
                {activeTab === 'expenses' && <ExpensesTab />}
                {activeTab === 'members' && <MembersTab />}
                {activeTab === 'settlement' && <SettlementTab />}
                {activeTab === 'reports' && <ReportsTab />}
                {activeTab === 'info' && <TripInfoTab />}
              </div>
            </div>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
}
