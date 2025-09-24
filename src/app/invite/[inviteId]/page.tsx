'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getGroupInvite, acceptGroupInvite } from '@/lib/actions/groups';
import { markNotificationAsRead } from '@/lib/actions/notifications';
import { GroupInvite, Group } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

export default function InviteAcceptPage() {
  const { inviteId } = useParams();
  const { user, loading } = useAuth();
  const [invite, setInvite] = useState<GroupInvite | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (inviteId && typeof inviteId === 'string') {
      loadInvite(inviteId);
    }
  }, [inviteId]);

  const loadInvite = async (inviteId: string) => {
    try {
      setLoadingInvite(true);
      const inviteData = await getGroupInvite(inviteId);
      setInvite(inviteData);
      
      // Load group info if invite exists
      if (inviteData) {
        // You might want to add a function to get group by ID
        // For now, we'll just show the invite info
      }
    } catch (error) {
      console.error('Error loading invite:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin lời mời');
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;

    try {
      setIsAccepting(true);
      await acceptGroupInvite(invite.id, user.uid);
      toast.success('Đã tham gia nhóm thành công!');
      
      // Redirect to group page or dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi chấp nhận lời mời');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading || loadingInvite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lời mời không tồn tại
          </h1>
          <p className="text-gray-600 mb-6">
            Lời mời này không tồn tại hoặc đã hết hạn
          </p>
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status !== 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lời mời đã được xử lý
          </h1>
          <p className="text-gray-600 mb-6">
            Lời mời này đã được chấp nhận hoặc từ chối trước đó
          </p>
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lời mời đã hết hạn
          </h1>
          <p className="text-gray-600 mb-6">
            Lời mời này đã hết hạn vào {formatDateTime(invite.expiresAt)}
          </p>
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để chấp nhận lời mời này
          </p>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user email matches invite email
  if (user.email !== invite.invitedEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lời mời không dành cho bạn
          </h1>
          <p className="text-gray-600 mb-6">
            Lời mời này được gửi đến {invite.invitedEmail}, không phải {user.email}
          </p>
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                📧
              </div>
              <CardTitle className="text-2xl">Lời mời tham gia nhóm</CardTitle>
              <CardDescription>
                Bạn đã được mời tham gia một nhóm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nhóm: {group?.name || 'Đang tải...'}
                </h3>
                <p className="text-gray-600">
                  Lời mời được gửi bởi: {invite.invitedBy}
                </p>
                <p className="text-sm text-gray-500">
                  Gửi lúc: {formatDateTime(invite.invitedAt)}
                </p>
                <p className="text-sm text-gray-500">
                  Hết hạn: {formatDateTime(invite.expiresAt)}
                </p>
              </div>

              {invite.message && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Lời nhắn:</h4>
                  <p className="text-gray-700">"{invite.message}"</p>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  onClick={handleAcceptInvite}
                  disabled={isAccepting}
                  className="flex-1"
                >
                  {isAccepting ? 'Đang tham gia...' : 'Chấp nhận lời mời'}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Từ chối
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Bằng cách chấp nhận, bạn sẽ trở thành thành viên của nhóm này.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
