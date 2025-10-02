'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getGroupBySlug, getGroupMembers, addGroupMember, removeGroupMember, transferGroupOwnership } from '@/lib/actions/groups';
import { getUserByIds, searchUsersByEmail } from '@/lib/actions/users';
import { Group, GroupMember, User } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';

export default function GroupMembersPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [memberUsers, setMemberUsers] = useState<{ [userId: string]: User }>({});
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'member'>('all');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadGroup(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (group && user) {
      checkOwnership();
      loadMembers();
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

  const loadMembers = async () => {
    if (!group) return;
    
    try {
      setLoadingMembers(true);
      console.log('=== LOADING GROUP MEMBERS ===');
      console.log('Group ID:', group.id);
      console.log('Group slug:', group.slug);
      
      const membersData = await getGroupMembers(group.id);
      console.log('Loaded members data:', membersData);
      console.log('Members count:', membersData.length);
      
      setMembers(membersData);
      
      // Load user information for each member
      const userIds = membersData.map(member => member.userId).filter(Boolean);
      console.log('=== LOADING USER DETAILS ===');
      console.log('Member data:', membersData);
      console.log('User IDs to fetch:', userIds);
      
      if (userIds.length > 0) {
        try {
          const users = await getUserByIds(userIds);
          console.log('Fetched users:', users);
          
          // Create user map from fetched users
          const userMap: { [userId: string]: User } = {};
          for (const userId of userIds) {
            const existingUser = users.find(u => u.id === userId);
            if (existingUser) {
              userMap[userId] = existingUser;
            } else {
              // User not found in system - show placeholder
              userMap[userId] = {
                id: userId,
                name: `User ${userId.slice(0, 8)}`,
                email: `user${userId.slice(0, 8)}@example.com`,
                username: `user-${userId.slice(0, 8)}`,
                createdAt: new Date(),
                googleUid: userId,
                avatar: ''
              };
              console.warn('User not found in system:', userId);
            }
          }
          
          console.log('Final user map:', userMap);
          setMemberUsers(userMap);
        } catch (error) {
          console.error('Error loading user details:', error);
          console.log('Falling back to mock data');
          // Fallback to mock data if real data fails
          const mockUsers = userIds.reduce((acc, userId) => ({
            ...acc,
            [userId]: {
              id: userId,
              name: `User ${userId.slice(0, 8)}`,
              email: `user${userId.slice(0, 8)}@example.com`,
              username: `user-${userId.slice(0, 8)}`,
              createdAt: new Date()
            }
          }), {});
          setMemberUsers(mockUsers);
        }
      } else {
        console.log('No user IDs to fetch');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách thành viên');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchEmail.trim()) {
      toast.error('Vui lòng nhập email để tìm kiếm');
      return;
    }

    try {
      setSearching(true);
      const users = await searchUsersByEmail(searchEmail.trim());
      setSearchResults(users);
      
      if (users.length === 0) {
        toast.info('Không tìm thấy người dùng nào với email này');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm người dùng');
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (selectedUser: User) => {
    if (!user || !group) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Check if user is already a member
    const existingMember = members.find(member => member.userId === selectedUser.id);
    if (existingMember) {
      toast.error('Người dùng này đã là thành viên của nhóm');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', user.uid);
      formData.append('groupId', group.id);
      formData.append('memberEmail', selectedUser.email);

      const result = await addGroupMember(formData);
      
      if (result.success) {
        toast.success('Thêm thành viên thành công!');
        setShowAddForm(false);
        setSearchEmail('');
        setSearchResults([]);
        loadMembers(); // Reload members
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm thành viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!user || !group) {
      toast.error('Vui lòng đăng nhập');
      return;
    }


    try {
      const result = await removeGroupMember(group.id, memberId, user.uid);
      
      if (result.success) {
        toast.success(result.message);
        loadMembers(); // Reload members
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa thành viên');
    }
  };

  const handleTransferOwnership = async (member: GroupMember) => {
    if (!user || !group) return;

    const userInfo = memberUsers[member.userId];
    const memberName = userInfo?.name || `User ${member.userId.slice(0, 8)}`;


    try {
      setIsSubmitting(true);
      await transferGroupOwnership(group.id, member.userId, user.uid);
      toast.success('Chuyển quyền chủ nhóm thành công!');
      loadMembers(); // Reload members
      setShowTransferModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi chuyển quyền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    const memberIds = filteredMembers
      .filter(member => member.role === 'member') // Only select members, not owners
      .map(member => member.id);
    
    if (selectedMembers.length === memberIds.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(memberIds);
    }
  };

  const handleBulkRemove = async () => {
    if (!user || !group || selectedMembers.length === 0) return;

    const memberNames = selectedMembers.map(memberId => {
      const member = members.find(m => m.id === memberId);
      const user = memberUsers[member?.userId || ''];
      return user?.name || `User ${member?.userId.slice(0, 8)}`;
    }).join(', ');


    try {
      setIsSubmitting(true);
      
      // Remove each selected member
      for (const memberId of selectedMembers) {
        await removeGroupMember(group.id, memberId, user.uid);
      }
      
      toast.success(`Đã xóa ${selectedMembers.length} thành viên thành công!`);
      setSelectedMembers([]);
      setShowBulkActions(false);
      loadMembers(); // Reload members
    } catch (error) {
      console.error('Error bulk removing members:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportMembers = () => {
    const csvData = filteredMembers.map(member => {
      const user = memberUsers[member.userId];
      return {
        'Tên': user?.name || `User ${member.userId.slice(0, 8)}`,
        'Email': user?.email || 'Không có',
        'Username': user?.username || 'Không có',
        'Vai trò': member.role === 'owner' ? 'Chủ nhóm' : 'Thành viên',
        'Tham gia': formatDate(member.joinedAt),
        'Trạng thái': member.leftAt ? 'Đã rời' : 'Hoạt động'
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `thanh-vien-${group?.slug || 'group'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Đã xuất danh sách thành viên thành công!');
  };

  // Filter and search members
  const filteredMembers = members.filter(member => {
    const user = memberUsers[member.userId];
    const userName = user?.name || `User ${member.userId.slice(0, 8)}`;
    const userEmail = user?.email || '';
    
    // Search filter
    const matchesSearch = !memberSearch || 
      userName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      userEmail.toLowerCase().includes(memberSearch.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (loading || loadingGroup) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
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
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Chỉ chủ nhóm mới có thể quản lý thành viên
          </p>
          <Link href={`/g/${group.slug}`}>
            <Button>Về trang nhóm</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý thành viên
              </h1>
              <p className="text-gray-600">
                Nhóm: {group.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                variant="outline"
              >
                {showAddForm ? 'Hủy' : 'Thêm thành viên'}
              </Button>
              <Button
                onClick={handleExportMembers}
                variant="outline"
                disabled={filteredMembers.length === 0}
              >
                Xuất CSV
              </Button>
              {group.type === 'close' && (
                <Link href={`/g/${group.slug}/requests`}>
                  <Button variant="outline">Yêu cầu tham gia</Button>
                </Link>
              )}
              <Link href={`/g/${group.slug}/invites`}>
                <Button variant="outline">Quản lý lời mời</Button>
              </Link>
              <Link href={`/g/${group.slug}`}>
                <Button variant="outline">Về trang nhóm</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Thêm thành viên mới</CardTitle>
              <CardDescription>
                Tìm kiếm và mời người dùng trong hệ thống tham gia nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Form */}
                <form onSubmit={handleSearchUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchEmail">Tìm kiếm theo email *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="searchEmail"
                        type="email"
                        placeholder="example@email.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={searching}>
                        {searching ? 'Đang tìm...' : 'Tìm kiếm'}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <Label>Kết quả tìm kiếm:</Label>
                    <div className="space-y-2">
                      {searchResults.map((user) => {
                        const isAlreadyMember = members.some(member => member.userId === user.id);
                        return (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-main rounded-lg">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                            <Button
                              onClick={() => handleAddMember(user)}
                              disabled={isSubmitting || isAlreadyMember}
                              size="sm"
                            >
                              {isAlreadyMember ? 'Đã là thành viên' : 'Thêm vào nhóm'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setSearchEmail('');
                      setSearchResults([]);
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberSearch">Tìm kiếm thành viên</Label>
                <Input
                  id="memberSearch"
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleFilter">Lọc theo vai trò</Label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'owner' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  <option value="owner">Chủ nhóm</option>
                  <option value="member">Thành viên</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {filteredMembers.length} / {members.length} thành viên
              </div>
              {filteredMembers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedMembers.length === filteredMembers.filter(m => m.role === 'member').length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </Button>
                  {selectedMembers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(!showBulkActions)}
                    >
                      Hành động ({selectedMembers.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {showBulkActions && selectedMembers.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Hành động hàng loạt</CardTitle>
              <CardDescription>
                Đã chọn {selectedMembers.length} thành viên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <DeleteConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang xóa...' : `Xóa ${selectedMembers.length} thành viên`}
                    </Button>
                  }
                  title="Xóa nhiều thành viên"
                  description={`Bạn có chắc chắn muốn xóa ${selectedMembers.length} thành viên đã chọn?`}
                  confirmText="Xóa"
                  cancelText="Hủy"
                  onConfirm={handleBulkRemove}
                  loadingText="Đang xóa..."
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMembers([]);
                    setShowBulkActions(false);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thành viên ({filteredMembers.length})</CardTitle>
            <CardDescription>
              Quản lý thành viên trong nhóm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {members.length === 0 ? 'Chưa có thành viên nào' : 'Không tìm thấy thành viên phù hợp'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-main rounded-lg">
                    <div className="flex items-center space-x-3">
                      {member.role === 'member' && (
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleSelectMember(member.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      )}
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {member.role === 'owner' ? '👑' : '👤'}
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/g/${group.slug}/members/${memberUsers[member.userId]?.username || member.userId}`}
                          className="hover:underline"
                        >
                          <p className="font-medium text-gray-900 hover:text-blue-600">
                            {memberUsers[member.userId]?.name || `User ${member.userId.slice(0, 8)}`}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-500">
                          {member.role === 'owner' ? 'Chủ nhóm' : 'Thành viên'}
                          {memberUsers[member.userId]?.email && (
                            <span> • {memberUsers[member.userId].email}</span>
                          )}
                          {' • '}
                          Tham gia {formatDate(member.joinedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Owner
                        </span>
                      )}
                      {member.role === 'member' && (
                        <>
                          <DeleteConfirmDialog
                            trigger={
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isSubmitting}
                              >
                                Chuyển quyền
                              </Button>
                            }
                            title="Chuyển quyền chủ nhóm"
                            description={`Bạn có chắc chắn muốn chuyển quyền chủ nhóm cho "${memberUsers[member.userId]?.name || 'Thành viên'}"? Bạn sẽ trở thành thành viên thường.`}
                            confirmText="Chuyển quyền"
                            cancelText="Hủy"
                            onConfirm={() => handleTransferOwnership(member)}
                            loadingText="Đang chuyển..."
                          />
                          <DeleteConfirmDialog
                            trigger={
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isSubmitting}
                              >
                                Xóa
                              </Button>
                            }
                            title="Xóa thành viên"
                            description={`Bạn có chắc chắn muốn xóa thành viên "${memberUsers[member.userId]?.name || 'Thành viên'}" khỏi nhóm?`}
                            confirmText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleRemoveMember(member.id, 'Thành viên')}
                            loadingText="Đang xóa..."
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
