'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getGroupBySlug, getGroupMembers } from '@/lib/actions/groups';
import { getUserByUsername, getUserById } from '@/lib/actions/users';
import { Group, GroupMember, User } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

export default function MemberProfilePage() {
  const { slug, username } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [member, setMember] = useState<GroupMember | null>(null);
  const [memberUser, setMemberUser] = useState<User | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMember, setLoadingMember] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

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

  const checkOwnership = useCallback(() => {
    if (group && user) {
      setIsOwner(user.uid === group.ownerId);
    }
  }, [group, user]);

  const loadMember = useCallback(async () => {
    if (!group || !username) return;
    
    try {
      setLoadingMember(true);
      
      // First, try to get user by username
      let targetUser: User | null = null;
      try {
        targetUser = await getUserByUsername(username as string);
      } catch {
        console.log('User not found by username, trying by ID');
        // If username is actually a user ID, try that
        try {
          targetUser = await getUserById(username as string);
        } catch (idError) {
          console.error('User not found by ID either:', idError);
          // Don't throw here, let the null check below handle it
        }
      }
      
      if (!targetUser) {
        toast.error('Không tìm thấy người dùng');
        router.push(`/g/${group.slug}/members`);
        return;
      }
      
      setMemberUser(targetUser);
      
      // Now get all group members to find the specific member
      const membersData = await getGroupMembers(group.id);
      const targetMember = membersData.find(m => m.userId === targetUser!.id);
      
      if (!targetMember) {
        toast.error('Người dùng này không phải thành viên của nhóm');
        router.push(`/g/${group.slug}/members`);
        return;
      }
      
      setMember(targetMember);
      
    } catch (error) {
      console.error('Error loading member:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin thành viên');
    } finally {
      setLoadingMember(false);
    }
  }, [group, username, router]);

  useEffect(() => {
    if (slug && typeof slug === 'string' && username && typeof username === 'string') {
      loadGroup(slug);
    }
  }, [slug, username]);

  useEffect(() => {
    if (group && user) {
      checkOwnership();
      loadMember();
    }
  }, [group, user, checkOwnership, loadMember]);

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
            Chỉ chủ nhóm mới có thể xem thông tin chi tiết thành viên
          </p>
          <Link href={`/g/${group.slug}`}>
            <Button>Về trang nhóm</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loadingMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member || !memberUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy thành viên
          </h1>
          <p className="text-gray-600 mb-6">
            Thành viên bạn đang tìm kiếm không tồn tại hoặc không phải thành viên của nhóm này
          </p>
          <Link href={`/g/${group.slug}/members`}>
            <Button>Về danh sách thành viên</Button>
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
                Thông tin thành viên
              </h1>
              <p className="text-gray-600">
                Nhóm: {group.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link href={`/g/${group.slug}/members`}>
                <Button variant="outline">Về danh sách thành viên</Button>
              </Link>
              <Link href={`/g/${group.slug}`}>
                <Button variant="outline">Về trang nhóm</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Member Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                    {member.role === 'owner' ? '👑' : '👤'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {memberUser.name || `User ${memberUser.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-gray-600">
                      @{memberUser.username || memberUser.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {member.role === 'owner' ? 'Chủ nhóm' : 'Thành viên'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">{memberUser.email || 'Không có'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Username</h4>
                    <p className="text-gray-600">@{memberUser.username || 'Không có'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tham gia nhóm</h4>
                    <p className="text-gray-600">{formatDateTime(member.joinedAt)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Trạng thái</h4>
                    <p className="text-gray-600">
                      {member.leftAt ? 'Đã rời nhóm' : 'Đang hoạt động'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử hoạt động</CardTitle>
                <CardDescription>
                  Các hoạt động của thành viên trong nhóm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Tham gia nhóm</p>
                      <p className="text-sm text-green-600">
                        {formatDateTime(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {member.leftAt && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                        ✗
                      </div>
                      <div>
                        <p className="font-medium text-red-800">Rời khỏi nhóm</p>
                        <p className="text-sm text-red-600">
                          {formatDateTime(member.leftAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Placeholder for future activities */}
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có hoạt động nào khác</p>
                    <p className="text-sm">Các hoạt động như tạo chuyến đi, thêm chi phí sẽ được hiển thị ở đây</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats & Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vai trò</span>
                  <span className="font-medium">
                    {member.role === 'owner' ? 'Chủ nhóm' : 'Thành viên'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian tham gia</span>
                  <span className="font-medium">
                    {Math.floor((Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24))} ngày
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chuyến đi tham gia</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng chi phí</span>
                  <span className="font-medium">0 VND</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.role === 'member' && (
                  <Button
                    onClick={() => {
                      // TODO: Implement transfer ownership
                      toast.info('Tính năng chuyển quyền sẽ được thêm sau');
                    }}
                    className="w-full"
                  >
                    Chuyển quyền chủ nhóm
                  </Button>
                )}
                {member.role === 'member' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?')) {
                        toast.info('Tính năng xóa thành viên sẽ được thêm sau');
                      }
                    }}
                    className="w-full"
                  >
                    Xóa khỏi nhóm
                  </Button>
                )}
                <Link href={`/g/${group.slug}/members`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Về danh sách thành viên
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
