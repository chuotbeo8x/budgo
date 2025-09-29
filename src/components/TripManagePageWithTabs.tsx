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
  const { paymentStatus: hookPaymentStatuses, updatePaymentStatus, updating, loading: paymentStatusLoading } = usePaymentStatus(trip.id, user?.uid);

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

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalAdvances = advances.reduce((sum, advance) => sum + advance.amount, 0);
  const netBalance = totalExpenses - totalAdvances;

  // Tab Content Components
  const TripInfoTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Thông tin chuyến đi
          </CardTitle>
          <CardDescription>
            Chỉnh sửa thông tin cơ bản của chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên chuyến đi *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                rows={3}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Địa điểm</Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
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
                <Label htmlFor="endDate">Ngày kết thúc</Label>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Tiền tệ</Label>
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
                <Label htmlFor="costPerPersonPlanned">Chi phí dự kiến/người</Label>
                <Input
                  id="costPerPersonPlanned"
                  name="costPerPersonPlanned"
                  type="number"
                  value={formData.costPerPersonPlanned}
                  onChange={handleInputChange}
                  disabled={!editing || isTripClosed}
                  className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverUrl">URL ảnh bìa</Label>
              <Input
                id="coverUrl"
                name="coverUrl"
                value={formData.coverUrl}
                onChange={handleInputChange}
                disabled={!editing || isTripClosed}
                className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
              />
            </div>

            {!editing ? (
              <Button
                type="button"
                onClick={() => setEditing(true)}
                disabled={isTripClosed}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa thông tin
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Settlement Summary */}
      {settlements && settlements.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Quyết toán chi phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SettlementSummary 
              settlements={settlements}
              currency={trip.currency}
              showDetails={true}
              isOwner={canManage}
              paymentStatus={hookPaymentStatuses}
              onPaymentStatusChange={handlePaymentStatusUpdate}
              updating={updating}
              loading={paymentStatusLoading}
            />
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
                    className="w-full justify-start bg-orange-600 hover:bg-orange-700"
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
                  variant="destructive"
                  className="w-full justify-start"
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
    <div className="space-y-6">
      <MembersInline 
        trip={trip}
        members={members}
        showAddButton={!isTripClosed}
        canEdit={!isTripClosed}
        canDelete={!isTripClosed}
        canInvite={!isTripClosed}
        onMemberAdded={() => {
          window.location.reload();
        }}
        onMemberUpdated={() => {
          window.location.reload();
        }}
        onMemberDeleted={() => {
          window.location.reload();
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
    <div className="space-y-6">
      <ExpensesInline 
        trip={trip}
        expenses={expenses}
        advances={advances}
        members={members}
        showAddButton={!isTripClosed}
        canEdit={!isTripClosed}
        canDelete={!isTripClosed}
        onExpenseAdded={() => {
          window.location.reload();
        }}
        onExpenseUpdated={() => {
          window.location.reload();
        }}
        onExpenseDeleted={() => {
          window.location.reload();
        }}
        onAdvanceAdded={() => {
          window.location.reload();
        }}
        onAdvanceUpdated={() => {
          window.location.reload();
        }}
        onAdvanceDeleted={() => {
          window.location.reload();
        }}
      />
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-orange-600" />
            Báo cáo và xuất dữ liệu
          </CardTitle>
          <CardDescription>
            Xuất báo cáo chi tiết và dữ liệu chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Xuất báo cáo tổng hợp chi phí và quyết toán
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/export` : `/trips/${trip.slug}/export`}>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Chi tiết quyết toán
          </CardTitle>
          <CardDescription>
            Xem chi tiết báo cáo quyết toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Xem báo cáo quyết toán chi tiết
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/settlement` : `/trips/${trip.slug}/settlement`}>
              <Button variant="outline" className="w-full">
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header - Compact */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href={backUrl}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {backLabel}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <span className="hidden sm:inline">Quản lý chuyến đi</span>
                  <span className="sm:hidden">Quản lý</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{trip.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Xem thông tin</span>
                  <span className="sm:hidden">Xem</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trip Status Banner */}
        {isTripClosed && (
          <div className="mb-6">
            <TripStatusAlerts.closed />
          </div>
        )}

        {/* Main Management Container */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Mobile Menu Button */}
            <div className="lg:hidden p-4 border-b">
              <Button
                variant="outline"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full justify-between text-sm"
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
                    className="w-full justify-start text-sm"
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
                    className="w-full justify-start text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Thành viên
                  </Button>
                  <Button
                    variant={activeTab === 'reports' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('reports');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-sm"
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
                    className="w-full justify-start text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Thông tin
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Tabs / Mobile Content */}
            <div className="hidden lg:block">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mx-4 mt-4 mb-0 gap-1">
              <TabsTrigger value="expenses" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Chi phí</span>
                <span className="sm:hidden truncate">CP</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Thành viên</span>
                <span className="sm:hidden truncate">TV</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Báo cáo</span>
                <span className="sm:hidden truncate">BC</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline truncate">Thông tin</span>
                <span className="sm:hidden truncate">TT</span>
              </TabsTrigger>
            </TabsList>
            
                <TabsContent value="expenses" className="mt-0">
                  <div className="p-4">
                    <ExpensesTab />
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="mt-0">
                  <div className="p-4">
                    <MembersTab />
                  </div>
                </TabsContent>
                
                <TabsContent value="reports" className="mt-0">
                  <div className="p-4">
                    <ReportsTab />
                  </div>
                </TabsContent>
                
                <TabsContent value="info" className="mt-0">
                  <div className="p-4">
                    <TripInfoTab />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Content */}
            <div className="lg:hidden">
              <div className="p-4">
                {activeTab === 'expenses' && <ExpensesTab />}
                {activeTab === 'members' && <MembersTab />}
                {activeTab === 'reports' && <ReportsTab />}
                {activeTab === 'info' && <TripInfoTab />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
