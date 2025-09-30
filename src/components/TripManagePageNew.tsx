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

interface TripManagePageNewProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripManagePageNew({ trip, groupSlug, backUrl, backLabel }: TripManagePageNewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<TripMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('info');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { settlements } = useSettlement(expenses, advances, members);
  const { paymentStatus: hookPaymentStatuses, updatePaymentStatus, updating, loading: paymentStatusLoading } = usePaymentStatus(trip.id, user?.uid);

  const safeDateInput = (value: any): string => {
    try {
      if (!value) return '';
      const d = toDate(value);
      if (isNaN(d.getTime())) return '';
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

  useEffect(() => {
    setPaymentStatuses(hookPaymentStatuses);
  }, [hookPaymentStatuses]);

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
      console.error('Error loading trip data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        destination: formData.destination.trim() || undefined,
        coverUrl: formData.coverUrl.trim() || undefined,
        currency: formData.currency,
        costPerPersonPlanned: formData.costPerPersonPlanned ? parseFloat(formData.costPerPersonPlanned) : undefined,
      };

      if (formData.startDate) {
        updateData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        updateData.endDate = new Date(formData.endDate);
      }

      await updateTrip(trip.id, updateData, user.uid);
      toast.success('Cập nhật chuyến đi thành công!');
      setEditing(false);
      // Refresh data instead of reloading page
      router.refresh();
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Có lỗi xảy ra khi cập nhật chuyến đi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!trip || !user) return;

    try {
      setSubmitting(true);
      await deleteTrip(trip.id, user.uid);
      toast.success('Xóa chuyến đi thành công');
      router.push(backUrl);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Có lỗi xảy ra khi xóa chuyến đi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTrip = async () => {
    if (!trip || !user) return;

    try {
      setSubmitting(true);
      await closeTrip(trip.id, user.uid);
      toast.success('Lưu trữ chuyến đi thành công');
      // Refresh data instead of reloading page
      router.refresh();
    } catch (error) {
      console.error('Error closing trip:', error);
      toast.error('Có lỗi xảy ra khi lưu trữ chuyến đi');
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
  const canManage = user?.uid === trip.ownerId || isMember;

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
      {settlements && settlements.length > 0 && (
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
      )}
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Quản lý thành viên
          </CardTitle>
          <CardDescription>
            Thêm, xóa và quản lý thành viên chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quản lý danh sách thành viên tham gia chuyến đi
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/manage/members` : `/trips/${trip.slug}/manage/members`}>
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Mở quản lý thành viên
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Quản lý chi phí
          </CardTitle>
          <CardDescription>
            Thêm, sửa và quản lý các khoản chi phí chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quản lý tất cả các khoản chi phí trong chuyến đi
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/manage/expenses` : `/trips/${trip.slug}/manage/expenses`}>
              <Button className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Mở quản lý chi phí
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Quản lý tạm ứng
          </CardTitle>
          <CardDescription>
            Quản lý các khoản tạm ứng trước chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quản lý tạm ứng và hoàn trả
            </p>
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/advances` : `/trips/${trip.slug}/advances`}>
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Mở quản lý tạm ứng
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
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

  const ActionsTab = () => (
    <div className="space-y-6">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={backUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-8 h-8 text-blue-600" />
                Quản lý chuyến đi
              </h1>
              <p className="text-gray-600 mt-1">{trip.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}` : `/trips/${trip.slug}`}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Xem thông tin
              </Button>
            </Link>
          </div>
        </div>

        {/* Trip Status Banner */}
        {isTripClosed && (
          <div className="mb-6">
            <TripStatusAlerts.closed />
          </div>
        )}

        {/* Management Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Trip Information Management */}
          <div className="lg:col-span-2">
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
                        onChange={handleInputChange}
                        disabled={!editing || isTripClosed}
                        className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                      >
                        <option value="VND">🇻🇳 VND (Việt Nam Đồng)</option>
                        <option value="USD">🇺🇸 USD (US Dollar)</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costPerPersonPlanned">Chi phí dự kiến cho mỗi người</Label>
                      <div className="relative">
                        <Input
                          id="costPerPersonPlanned"
                          name="costPerPersonPlanned"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.costPerPersonPlanned}
                          onChange={handleInputChange}
                          disabled={!editing || isTripClosed}
                          placeholder="Nhập chi phí dự kiến"
                          className={`pr-8 ${!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}`}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          {formData.currency}
                        </span>
                      </div>
                    </div>
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
                    <div className="flex gap-3">
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
            {settlements && settlements.length > 0 && (
              <Card className="mt-6">
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
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <TripStats 
              trip={trip}
              expenses={expenses}
              advances={advances}
              members={members}
            />

            {/* Management Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Quản lý
                </CardTitle>
                <CardDescription>
                  Các hành động quản lý chuyến đi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/members` : `/trips/${trip.slug}/manage/members`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Quản lý thành viên
                  </Button>
                </Link>
                <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/expenses` : `/trips/${trip.slug}/manage/expenses`}>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Quản lý chi phí
                  </Button>
                </Link>
                <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/advances` : `/trips/${trip.slug}/advances`}>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Quản lý tạm ứng
                  </Button>
                </Link>
                <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/settlement` : `/trips/${trip.slug}/settlement`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Chi tiết quyết toán
                  </Button>
                </Link>
                <Link href={groupSlug ? `/g/${groupSlug}/trips/${trip.slug}/export` : `/trips/${trip.slug}/export`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Xuất báo cáo
                  </Button>
                </Link>
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
          </div>
        </div>

        {/* Warning for closing trip */}
        {!isTripClosed && (
          <TripStatusAlerts.warningForClosing />
        )}
      </div>
    </div>
  );
}
