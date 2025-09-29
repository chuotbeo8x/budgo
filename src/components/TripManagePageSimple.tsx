'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateTrip, deleteTrip, closeTrip } from '@/lib/actions/trips';
import { Trip } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Settings, Eye } from 'lucide-react';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { TripStatusAlerts } from '@/components/ui/AlertMessage';

interface TripManagePageSimpleProps {
  trip: Trip;
  groupSlug?: string; // Optional for group trips
  backUrl: string;
  backLabel: string;
}

export default function TripManagePageSimple({ trip, groupSlug, backUrl, backLabel }: TripManagePageSimpleProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

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

  const isTripClosed = trip.status === 'closed';
  const canManage = user?.uid === trip.ownerId;

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

        {/* Management Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chuyến đi</CardTitle>
              <CardDescription>
                Tên: {trip.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Mô tả: {trip.description || 'Không có'}</p>
              <p className="text-gray-600">Địa điểm: {trip.destination || 'Không có'}</p>
              <p className="text-gray-600">Tiền tệ: {trip.currency}</p>
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
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
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
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
                      className="w-full"
                    >
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
    </div>
  );
}
