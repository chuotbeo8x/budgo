'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getGroupBySlug, getJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/lib/actions/groups';
import { getUserByIds } from '@/lib/actions/users';
import { Group, JoinRequest, User } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

export default function GroupRequestsPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [requestUsers, setRequestUsers] = useState<{ [userId: string]: User }>({});
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadGroup(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (group && user) {
      checkOwnership();
      loadRequests();
    }
  }, [group, user]);

  const loadGroup = async (groupSlug: string) => {
    try {
      setLoadingGroup(true);
      const groupData = await getGroupBySlug(groupSlug);
      setGroup(groupData);
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setLoadingGroup(false);
    }
  };

  const checkOwnership = () => {
    if (group && user) {
      setIsOwner(user.uid === group.ownerId);
    }
  };

  const loadRequests = async () => {
    if (!group || !user) return;
    
    try {
      setLoadingRequests(true);
      const requestsData = await getJoinRequests(group.id, user.uid);
      setRequests(requestsData);
      
      // Load user information for each request
      const userIds = requestsData.map(request => request.userId);
      if (userIds.length > 0) {
        const users = await getUserByIds(userIds);
        const userMap: { [userId: string]: User } = {};
        users.forEach(user => {
          userMap[user.id] = user;
        });
        setRequestUsers(userMap);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách yêu cầu');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      setActionLoading(requestId);
      await approveJoinRequest(requestId, user.uid);
      toast.success('Đã phê duyệt yêu cầu tham gia');
      loadRequests(); // Reload requests
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi phê duyệt yêu cầu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;
    
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      return;
    }
    
    try {
      setActionLoading(requestId);
      await rejectJoinRequest(requestId, user.uid);
      toast.success('Đã từ chối yêu cầu tham gia');
      loadRequests(); // Reload requests
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || loadingGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy nhóm
          </h1>
          <p className="text-gray-600 mb-6">
            Nhóm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <Link href="/dashboard">
            <Button>Về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Chỉ chủ nhóm mới có thể xem yêu cầu tham gia
          </p>
          <Link href={`/g/${group.slug}`}>
            <Button>Về trang nhóm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Yêu cầu tham gia nhóm
              </h1>
              <p className="text-gray-600">
                Nhóm: {group.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link href={`/g/${group.slug}/members`}>
                <Button variant="outline">Quản lý thành viên</Button>
              </Link>
              <Link href={`/g/${group.slug}`}>
                <Button variant="outline">Về trang nhóm</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu tham gia ({requests.length})</CardTitle>
            <CardDescription>
              Phê duyệt hoặc từ chối yêu cầu tham gia nhóm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có yêu cầu tham gia nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const requestUser = requestUsers[request.userId];
                  return (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {requestUser ? requestUser.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {requestUser ? requestUser.name : `User ${request.userId.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {requestUser?.email && (
                              <span>{requestUser.email} • </span>
                            )}
                            Yêu cầu {formatDateTime(request.requestedAt)}
                          </p>
                          {request.message && (
                            <p className="text-sm text-gray-600 mt-1">
                              "{request.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Đang xử lý...' : 'Phê duyệt'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Đang xử lý...' : 'Từ chối'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




