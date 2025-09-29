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
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, AlertTriangle, Edit, X, Calendar, MapPin } from 'lucide-react';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';

interface TripManagePageProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripManagePage({ trip, groupSlug, backUrl, backLabel }: TripManagePageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const isOwner = user?.uid === trip.ownerId;
  const isTripClosed = trip.status === 'closed';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!trip || !user) return;

    try {
      setSubmitting(true);
      await updateTrip({
        tripId: trip.id,
        userId: user.uid,
        ...formData,
      });
      toast.success('Cập nhật thông tin chuyến đi thành công');
      setEditing(false);
      // Reload the page to get updated data
      window.location.reload();
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
      // Reload the page to get updated data
      window.location.reload();
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
    });
    setEditing(false);
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
            <p className="text-muted-foreground mb-4">Chỉ chủ chuyến đi mới có thể quản lý</p>
            <Link href={backUrl}>
              <Button>{backLabel}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={backUrl}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý chuyến đi</h1>
          <p className="text-gray-600">Cập nhật thông tin và quản lý chuyến đi của bạn</p>
        </div>

        {/* Trip Status Alert */}
        {isTripClosed && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5"></div>
              <div className="relative p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">Chuyến đi đã được lưu trữ</h3>
                    <p className="text-red-700 text-sm">
                      Không thể thêm, sửa hoặc xóa chi phí và tạm ứng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Trip Management Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <Edit className="w-8 h-8 text-white" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${isTripClosed ? 'bg-red-500' : 'bg-green-500'} rounded-full border-2 border-white flex items-center justify-center`}>
                    <div className={`w-2.5 h-2.5 ${isTripClosed ? 'bg-red-500' : 'bg-green-500'} rounded-full`}></div>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">{trip.name}</CardTitle>
                  <p className="text-gray-600 mt-1">
                    {isTripClosed ? 'Chuyến đi đã được lưu trữ' : 'Chuyến đi đang hoạt động'} • Cập nhật thông tin chi tiết
                  </p>
                </div>
                <div className="ml-auto flex gap-3">
                  {!editing ? (
                    <Button 
                      onClick={() => setEditing(true)} 
                      disabled={isTripClosed}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSave} 
                        disabled={submitting}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {submitting ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        disabled={submitting}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên chuyến đi *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing || isTripClosed}
                      placeholder="Nhập tên chuyến đi"
                      className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-sm font-medium text-gray-700">Điểm đến</Label>
                    <Input
                      id="destination"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      disabled={!editing || isTripClosed}
                      placeholder="Nhập điểm đến"
                      className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                    />
                  </div>
                </div>
              </div>

              {/* Date Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thời gian</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin bổ sung</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="coverUrl" className="text-sm font-medium text-gray-700">URL ảnh bìa</Label>
                    <Input
                      id="coverUrl"
                      name="coverUrl"
                      value={formData.coverUrl}
                      onChange={handleInputChange}
                      disabled={!editing || isTripClosed}
                      placeholder="https://example.com/image.jpg"
                      className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
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
                      placeholder="Nhập mô tả chuyến đi"
                      className={!editing || isTripClosed ? 'bg-gray-50 border-gray-300 text-gray-600' : ''}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Tiền tệ</Label>
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
                      <Label htmlFor="costPerPersonPlanned" className="text-sm font-medium text-gray-700">Chi phí dự kiến cho mỗi người</Label>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            {isTripClosed && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                Chuyến đi đã được lưu trữ - Không thể thực hiện thay đổi
              </div>
            )}
            <div className="flex gap-3 ml-auto">
              {!isTripClosed && (
                <DeleteConfirmDialog
                  trigger={
                    <Button
                      disabled={submitting}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
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
            </div>
          </div>
          
          {!isTripClosed && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Lưu ý quan trọng</p>
                  <p className="text-xs text-yellow-700">
                    Sau khi lưu trữ chuyến đi, bạn sẽ không thể thêm, sửa hoặc xóa chi phí và tạm ứng. 
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
