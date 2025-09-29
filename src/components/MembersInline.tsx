'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addTripMember, removeTripMember, searchUsers, getGroupMembers } from '@/lib/actions/trips';
import { getUserGroups } from '@/lib/actions/groups';
import { Trip, TripMember } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';
import { 
  Plus, 
  User, 
  Users,
  Crown,
  Calendar,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Search,
  UserCheck,
  Ghost,
  Mail,
  Phone,
  UserX,
  Loader2
} from 'lucide-react';

interface MembersInlineProps {
  trip: Trip;
  members: TripMember[];
  showAddButton?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canInvite?: boolean;
  onMemberAdded?: (member: TripMember) => void;
  onMemberUpdated?: (member: TripMember) => void;
  onMemberDeleted?: (memberId: string) => void;
}

export default function MembersInline({
  trip,
  members,
  showAddButton = true,
  canEdit = true,
  canDelete = true,
  canInvite = true,
  onMemberAdded,
  onMemberUpdated,
  onMemberDeleted
}: MembersInlineProps) {
  
  const { user } = useAuth();
  const [localMembers, setLocalMembers] = useState<TripMember[]>(members);
  const [showAddForm, setShowAddForm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [addMethod, setAddMethod] = useState<'search' | 'group' | 'ghost'>('search');
  
  // Sync local members with props
  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  // Focus management for modal
  useEffect(() => {
    if (showAddForm && modalRef.current) {
      // Focus on first input when modal opens
      const firstInput = modalRef.current.querySelector('input, select, textarea') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [showAddForm]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Group state
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);

  const isTripClosed = trip?.status === 'closed';

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  const loadUserGroups = async () => {
    if (!user) return;
    
    try {
      setLoadingGroups(true);
      const groups = await getUserGroups(user.uid);
      setUserGroups(groups || []);
    } catch (error) {
      console.error('Error loading user groups:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách nhóm');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm người dùng');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
  };

  const handleGroupSelect = async (group: any) => {
    setSelectedGroup(group);
    setSelectedGroupMembers([]);
    
    try {
      setLoadingGroupMembers(true);
      const members = await getGroupMembers(group.id);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
      toast.error('Có lỗi xảy ra khi tải thành viên nhóm');
    } finally {
      setLoadingGroupMembers(false);
    }
  };

  const handleGroupMemberToggle = (member: any) => {
    setSelectedGroupMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== handleSubmit START ===');
    console.log('Trip:', trip?.id);
    console.log('User:', user?.uid);
    console.log('Add method:', addMethod);
    console.log('Form data:', formData);
    console.log('Selected user:', selectedUser);
    console.log('Selected group:', selectedGroup);
    console.log('Selected group members:', selectedGroupMembers);
    
    if (!trip || !user) {
      console.log('Missing trip or user');
      return;
    }

    // Validate form based on method
    if (addMethod === 'ghost') {
      if (!formData.name.trim()) {
        toast.error('Vui lòng nhập tên thành viên ảo');
        return;
      }
    } else if (addMethod === 'search') {
      if (!selectedUser) {
        toast.error('Vui lòng chọn user từ kết quả tìm kiếm');
        return;
      }
    } else if (addMethod === 'group') {
      if (selectedGroupMembers.length === 0) {
        toast.error('Vui lòng chọn ít nhất một thành viên từ nhóm');
        return;
      }
    }

    try {
      setSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append('tripId', trip.id);
      
      if (addMethod === 'ghost') {
        formDataObj.append('ghostName', formData.name.trim());
        if (formData.email) formDataObj.append('email', formData.email.trim());
        if (formData.phone) formDataObj.append('phone', formData.phone.trim());
        formDataObj.append('method', 'ghost');
      } else if (addMethod === 'search') {
        formDataObj.append('searchQuery', searchQuery.trim());
        formDataObj.append('selectedUserId', selectedUser.id);
        formDataObj.append('method', 'search');
      } else if (addMethod === 'group') {
        formDataObj.append('method', 'group');
        formDataObj.append('groupId', selectedGroup.id);
        selectedGroupMembers.forEach(member => {
          formDataObj.append('selectedMembers', member.id);
        });
      }

      // Create optimistic member objects based on method
      const optimisticMembers: TripMember[] = [];
      console.log('Creating optimistic members for method:', addMethod);
      
      if (addMethod === 'ghost') {
        const tempMember: TripMember = {
          id: `temp-ghost-${Date.now()}`,
          tripId: trip.id,
          name: formData.name.trim(),
          ghostName: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          userId: undefined,
          joinedAt: new Date(),
          isOwner: false,
          paymentStatus: 'pending'
        };
        optimisticMembers.push(tempMember);
      } else if (addMethod === 'search' && selectedUser) {
        const tempMember: TripMember = {
          id: `temp-user-${Date.now()}`,
          tripId: trip.id,
          name: selectedUser.displayName || selectedUser.username || 'Unknown',
          userId: selectedUser.id,
          email: selectedUser.email,
          phone: selectedUser.phone,
          joinedAt: new Date(),
          isOwner: false,
          paymentStatus: 'pending'
        };
        optimisticMembers.push(tempMember);
      } else if (addMethod === 'group') {
        selectedGroupMembers.forEach(member => {
          const tempMember: TripMember = {
            id: `temp-group-${Date.now()}-${member.id}`,
            tripId: trip.id,
            name: member.displayName || member.username || 'Unknown',
            userId: member.id,
            email: member.email,
            phone: member.phone,
            joinedAt: new Date(),
            isOwner: false,
            paymentStatus: 'pending'
          };
          optimisticMembers.push(tempMember);
        });
      }
      
      // Optimistically add to local state FIRST
      console.log('Adding optimistic members:', optimisticMembers);
      setLocalMembers(prev => [...prev, ...optimisticMembers]);
      
      // Reset form
      console.log('Closing form and resetting state');
      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
      });
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setSelectedGroup(null);
      setSelectedGroupMembers([]);
      setGroupMembers([]);
      
      // Show success immediately
      toast.success('Thêm thành viên thành công!');
      
      // Reset submitting state immediately
      setSubmitting(false);
      
      // Call server action in background (don't await to prevent blocking)
      addTripMember(formDataObj, user?.uid).catch((error) => {
        console.error('Error adding member:', error);
        toast.error('Có lỗi xảy ra khi thêm thành viên');
        // Revert optimistic update on error
        setLocalMembers(prev => prev.filter(member => 
          !optimisticMembers.some(opt => opt.id === member.id)
        ));
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Có lỗi xảy ra khi thêm thành viên');
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user || !trip?.id) return;
    try {
      setSubmitting(true);
      
      // Store original member for potential revert
      const originalMember = localMembers.find(m => m.id === memberId);
      
      // Optimistically remove from local state FIRST
      setLocalMembers(prev => prev.filter(member => member.id !== memberId));
      
      // Show success immediately
      toast.success('Xóa thành viên thành công');
      
      // Reset submitting state immediately
      setSubmitting(false);
      
      // Call server action in background (don't await to prevent blocking)
      removeTripMember(trip.id, memberId, user.uid).catch((error) => {
        console.error('Error removing member:', error);
        toast.error('Có lỗi xảy ra khi xóa thành viên');
        // Revert optimistic update on error
        if (originalMember) {
          setLocalMembers(prev => [...prev, originalMember]);
        }
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
      setSubmitting(false);
    }
  };

  const getMemberRole = (member: TripMember) => {
    if (member.role === 'creator') return { label: 'Chủ chuyến đi', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Crown };
    return { label: 'Thành viên', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: UserCheck };
  };

  const getMemberName = (member: TripMember) => {
    return member.name || member.ghostName || 'Unknown';
  };

  const getMemberDisplayInfo = (member: TripMember) => {
    if (member.ghostName) {
      return {
        name: member.ghostName,
        type: 'ghost',
        icon: Ghost,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      };
    }
    
    return {
      name: member.name || 'Unknown',
      type: 'user',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
  };

  if (!trip) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Không tìm thấy chuyến đi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Members List */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Danh sách thành viên
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {localMembers.length} thành viên
              </div>
              {showAddButton && !isTripClosed && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thành viên
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {localMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thành viên nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu thêm thành viên cho chuyến đi</p>
              {showAddButton && !isTripClosed && (
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thành viên đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Thành viên</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Số điện thoại</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Vai trò</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Tham gia</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {localMembers.map((member) => {
                    const isOwnerMember = member.role === 'creator' || member.userId === trip.ownerId;
                    const canRemove = canDelete && !isOwnerMember && !isTripClosed;
                    
                    return (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              {isOwnerMember && (
                                <div className="flex items-center gap-1 text-yellow-600 mt-1">
                                  <Crown className="w-3 h-3" />
                                  <span className="text-xs font-medium">Người tổ chức</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{member.optionalEmail || 'Chưa có email'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{(member as any).optionalPhone || 'Chưa có số điện thoại'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOwnerMember 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isOwnerMember ? 'Người tổ chức' : 'Thành viên'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(member.joinedAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {canRemove && (
                            <DeleteConfirmDialog
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              }
                              title="Xóa thành viên"
                              description="Bạn có chắc chắn muốn xóa thành viên này?"
                              confirmText="Xóa"
                              cancelText="Hủy"
                              onConfirm={() => handleRemoveMember(member.id)}
                              loadingText="Đang xóa..."
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Form Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowAddForm(false);
            }
          }}
        >
          <Card ref={modalRef} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Thêm thành viên</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Method Selection */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={addMethod === 'search' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAddMethod('search')}
                    className="flex-1"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                  <Button
                    type="button"
                    variant={addMethod === 'group' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAddMethod('group')}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Từ nhóm
                  </Button>
                  <Button
                    type="button"
                    variant={addMethod === 'ghost' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAddMethod('ghost')}
                    className="flex-1"
                  >
                    <Ghost className="w-4 h-4 mr-2" />
                    Thành viên ảo
                  </Button>
                </div>

                {/* Search Method */}
                {addMethod === 'search' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tìm kiếm người dùng
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên, email hoặc username..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {searching && (
                      <div className="text-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                        <p className="text-sm text-gray-600 mt-2">Đang tìm kiếm...</p>
                      </div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSelectUser(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {(user.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                                {user.username && (
                                  <div className="text-xs text-gray-500">@{user.username}</div>
                                )}
                              </div>
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedUser && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{selectedUser.name}</div>
                            <div className="text-sm text-gray-600">{selectedUser.email}</div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(null)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Group Method */}
                {addMethod === 'group' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn nhóm
                      </label>
                      {loadingGroups ? (
                        <div className="text-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                          {userGroups.map((group) => (
                            <div
                              key={group.id}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                selectedGroup?.id === group.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                              onClick={() => handleGroupSelect(group)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{group.name}</div>
                                  <div className="text-sm text-gray-600">{group.memberCount} thành viên</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedGroup && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>Chọn thành viên từ nhóm "{selectedGroup.name}"</span>
                        </div>
                        
                        {loadingGroupMembers ? (
                          <div className="text-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            {groupMembers.map((member) => {
                              const isSelected = selectedGroupMembers.some(m => m.id === member.id);
                              return (
                                <div
                                  key={member.id}
                                  className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleGroupMemberToggle(member)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {(member.name || 'U').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{member.name}</div>
                                      <div className="text-sm text-gray-600">{member.email}</div>
                                    </div>
                                    {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {selectedGroupMembers.length > 0 && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-blue-800">
                              <CheckCircle className="w-4 h-4" />
                              <span>Đã chọn {selectedGroupMembers.length} thành viên</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Ghost Method */}
                {addMethod === 'ghost' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên thành viên ảo *
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên thành viên ảo"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (tùy chọn)
                      </label>
                      <input
                        type="email"
                        placeholder="Nhập email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại (tùy chọn)
                      </label>
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang thêm...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm thành viên
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
