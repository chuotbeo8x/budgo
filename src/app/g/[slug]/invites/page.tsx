'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getGroupBySlug, getGroupInvites, createGroupInvite, getGroupRequests } from '@/lib/actions/groups';
import { Group, GroupInvite, GroupRequest } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function GroupInvitesPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<'invites' | 'requests'>('invites');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    invitedEmail: '',
    invitedUsername: '',
    message: '',
  });

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadGroup(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (group && user) {
      checkOwnership();
      loadInvites();
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

  const loadInvites = async () => {
    if (!group || !user) return;
    
    try {
      setLoadingInvites(true);
      const invitesData = await getGroupInvites(group.id, user.uid);
      setInvites(invitesData);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách lời mời');
    } finally {
      setLoadingInvites(false);
    }
  };

  const loadRequests = async () => {
    if (!group || !user) return;
    
    try {
      setLoadingRequests(true);
      const requestsData = await getGroupRequests(group.id, user.uid);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách yêu cầu tham gia');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group || !user) return;
    
    if (!inviteForm.invitedEmail.trim() && !inviteForm.invitedUsername.trim()) {
      toast.error('Vui lòng nhập email hoặc username');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('userId', user.uid);
      formData.append('groupId', group.id);
      formData.append('invitedEmail', inviteForm.invitedEmail.trim());
      formData.append('invitedUsername', inviteForm.invitedUsername.trim());
      formData.append('message', inviteForm.message.trim());

      const result = await createGroupInvite(formData);
      
      if (result.success) {
        toast.success('Đã gửi lời mời thành công!');
        setInviteForm({ invitedEmail: '', invitedUsername: '', message: '' });
        setShowInviteForm(false);
        loadInvites(); // Reload invites
      } else {
        // Show warning toast for non-error cases
        toast.warning(result.message || 'Không thể gửi lời mời', {
          description: 'Vui lòng kiểm tra lại thông tin và thử lại',
        });
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo lời mời');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (invite: GroupInvite) => {
    if (invite.status === 'accepted') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Đã chấp nhận</span>;
    } else if (invite.status === 'expired') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">⏰ Hết hạn</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">⏳ Chờ phản hồi</span>;
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
            Chỉ chủ nhóm mới có thể quản lý lời mời
          </p>
          <Link href={`/g/${group.slug}`}>
            <Button>Về trang nhóm</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Allow invites for all group types
  // Public groups: invite is optional (users can join directly)
  // Close groups: invite bypasses approval process
  // Secret groups: invite is the only way to join

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý lời mời
              </h1>
              <p className="text-gray-600">
                Nhóm: {group.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowInviteForm(!showInviteForm)}
                variant="outline"
              >
                {showInviteForm ? 'Hủy' : 'Mời thành viên'}
              </Button>
              <Link href={`/g/${group.slug}/members`}>
                <Button variant="outline">Quản lý thành viên</Button>
              </Link>
              <Link href={`/g/${group.slug}`}>
                <Button variant="outline">Về trang nhóm</Button>
              </Link>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('invites')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'invites'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lời mời ({invites.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'requests'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yêu cầu tham gia ({requests.length})
            </button>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mời thành viên mới</CardTitle>
              <CardDescription>
                Gửi lời mời tham gia nhóm
                {group.type === 'public' && ' (người được mời có thể tham gia trực tiếp)'}
                {group.type === 'close' && ' (người được mời sẽ được thêm vào nhóm ngay lập tức)'}
                {group.type === 'secret' && ' (đây là cách duy nhất để tham gia nhóm)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invitedEmail">Email người được mời</Label>
                    <Input
                      id="invitedEmail"
                      type="email"
                      placeholder="example@email.com"
                      value={inviteForm.invitedEmail}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, invitedEmail: e.target.value, invitedUsername: '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invitedUsername">Username người được mời</Label>
                    <Input
                      id="invitedUsername"
                      type="text"
                      placeholder="username"
                      value={inviteForm.invitedUsername}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, invitedUsername: e.target.value, invitedEmail: '' }))}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Nhập email hoặc username của người bạn muốn mời. Chỉ cần điền một trong hai trường.</p>
                  <p className="mt-1 text-amber-600">
                    💡 <strong>Lưu ý:</strong> Nếu người dùng đã là thành viên hoặc đã có lời mời chờ, hệ thống sẽ thông báo thay vì tạo lời mời mới.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Lời nhắn (tùy chọn)</Label>
                  <textarea
                    id="message"
                    placeholder="Lời nhắn cho người được mời..."
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang gửi...' : 'Gửi lời mời'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteForm({ invitedEmail: '', invitedUsername: '', message: '' });
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content based on active tab */}
        {activeTab === 'invites' ? (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách lời mời ({invites.length})</CardTitle>
              <CardDescription>
                Quản lý lời mời tham gia nhóm
                {invites.length > 0 && (
                  <span className="block mt-1 text-sm text-gray-500">
                    💡 Người được mời sẽ nhận thông báo trong hệ thống và có thể chấp nhận từ trang thông báo.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          <CardContent>
            {loadingInvites ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có lời mời nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        📧
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.invitedEmail}
                          {invite.invitedUsername && (
                            <span className="text-gray-500"> (@{invite.invitedUsername})</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Gửi {formatDateTime(invite.invitedAt)}
                          {invite.expiresAt && (
                            <span> • Hết hạn {formatDateTime(invite.expiresAt)}</span>
                          )}
                        </p>
                        {invite.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            &quot;{invite.message}&quot;
                          </p>
                        )}
                        {invite.acceptedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Chấp nhận {formatDateTime(invite.acceptedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(invite)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Danh sách yêu cầu tham gia ({requests.length})</CardTitle>
              <CardDescription>
                Quản lý yêu cầu tham gia nhóm từ người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có yêu cầu tham gia
                  </h3>
                  <p className="text-gray-500">
                    Chưa có ai yêu cầu tham gia nhóm này
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.userName || 'Người dùng không xác định'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.userEmail || 'Email không xác định'}
                            </p>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-1">
                                &quot;{request.message}&quot;
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Yêu cầu lúc: {formatDateTime(request.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending' ? '⏳ Chờ duyệt' : 
                           request.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


