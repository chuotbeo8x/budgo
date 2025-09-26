'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTripMembers, addTripMember, removeTripMember, searchUsers, getGroupMembers } from '@/lib/actions/trips';
import { getUserGroups } from '@/lib/actions/groups';
import { Trip, TripMember } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  Plus, 
  ArrowLeft, 
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
  Phone
} from 'lucide-react';

interface MembersPageProps {
  trip: Trip;
  backUrl: string;
  backLabel: string;
  showAddButton?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canInvite?: boolean;
}

export default function MembersPage({ 
  trip, 
  backUrl, 
  backLabel, 
  showAddButton = true,
  canEdit = true,
  canDelete = true,
  canInvite = true
}: MembersPageProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TripMember[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addMethod, setAddMethod] = useState<'search' | 'group' | 'ghost'>('search');
  
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

  useEffect(() => {
    if (trip?.id && user) {
      loadData();
      loadUserGroups();
    }
  }, [trip?.id, user]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const membersData = await getTripMembers(trip.id);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoadingData(false);
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
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSearchResults([]);
  };

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
    if (!trip || !user) return;

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
      if (selectedGroupMembers.length === 0) {
        toast.error('Vui lòng chọn ít nhất một thành viên từ nhóm');
        return;
      }
      
      formDataObj.append('method', 'group');
      formDataObj.append('groupId', selectedGroup.id);
      selectedGroupMembers.forEach(member => {
        formDataObj.append('selectedMembers', member.id);
      });
    }

    await addTripMember(formDataObj, user?.uid);
    toast.success('Thêm thành viên thành công!');
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
    loadData();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Có lỗi xảy ra khi thêm thành viên');
    } finally {
      setSubmitting(false);
    }
  };


  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;

    try {
      await removeTripMember(trip.id, memberId);
      toast.success('Xóa thành viên thành công!');
      loadData();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
    }
  };


  const isOwner = user?.uid === trip.ownerId;

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={backUrl}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Thành viên chuyến đi
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Quản lý thành viên trong chuyến đi "{trip.name}"
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng thành viên</p>
                  <p className="text-3xl font-bold">{members.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Chủ chuyến đi</p>
                  <p className="text-3xl font-bold">1</p>
                </div>
                <Crown className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Thành viên mới</p>
                  <p className="text-3xl font-bold">{members.length - 1}</p>
                </div>
                <UserPlus className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Thêm thành viên mới</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn cách thêm thành viên
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setAddMethod('search')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      addMethod === 'search'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Tìm trong hệ thống</h3>
                        <p className="text-sm text-gray-600">Tìm và thêm user có tài khoản</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAddMethod('group')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      addMethod === 'group'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Từ nhóm</h3>
                        <p className="text-sm text-gray-600">Chọn thành viên trong nhóm</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setAddMethod('ghost')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      addMethod === 'ghost'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Ghost className="w-5 h-5 text-purple-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">Thành viên ảo</h3>
                        <p className="text-sm text-gray-600">Tạo thành viên chỉ có tên</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {addMethod === 'search' && (
                  <div>
                    <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                      Tìm kiếm user
                    </label>
                    <div className="relative">
                      <input
                        id="searchQuery"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleSearch(e.target.value);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tìm kiếm theo tên, email hoặc username..."
                        required
                      />
                      <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      💡 Gợi ý: Bạn có thể tìm kiếm một phần tên, email hoặc username. Ví dụ: "nguyen", "gmail", "john"
                    </p>

                    {/* Search Results */}
                    {searching && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-600">Đang tìm kiếm...</span>
                        </div>
                      </div>
                    )}

                    {searchResults.length > 0 && !searching && (
                      <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                        <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                          Tìm thấy {searchResults.length} kết quả
                        </div>
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                                {user.username && (
                                  <div className="text-xs text-gray-500">@{user.username}</div>
                                )}
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                Chọn
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery && searchResults.length === 0 && !searching && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Không tìm thấy user nào phù hợp với "{searchQuery}"
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
                        </p>
                      </div>
                    )}

                    {selectedUser && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {selectedUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{selectedUser.name}</div>
                            <div className="text-sm text-gray-600">{selectedUser.email}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(null);
                              setSearchQuery('');
                            }}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {addMethod === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn nhóm và thành viên
                    </label>
                    
                    {/* Group Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Chọn nhóm
                      </label>
                      {userGroups.length === 0 ? (
                        <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                          <p className="text-sm text-gray-600">
                            Bạn chưa tham gia nhóm nào. 
                            <button
                              type="button"
                              onClick={loadUserGroups}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              Tải lại danh sách
                            </button>
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {userGroups.map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => handleGroupSelect(group)}
                              className={`p-3 border-2 rounded-lg text-left transition-colors ${
                                selectedGroup?.id === group.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-medium text-gray-900">{group.name}</div>
                              <div className="text-sm text-gray-600">{group.description}</div>
                              <div className="text-xs text-gray-500 capitalize">{group.type}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Group Members Selection */}
                    {selectedGroup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          Chọn thành viên từ nhóm "{selectedGroup.name}"
                        </label>
                        {loadingGroupMembers ? (
                          <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm text-gray-600">Đang tải thành viên...</span>
                            </div>
                          </div>
                        ) : groupMembers.length === 0 ? (
                          <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                            <p className="text-sm text-gray-600">Nhóm này chưa có thành viên nào</p>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                            {groupMembers.map((member) => {
                              const isSelected = selectedGroupMembers.some(m => m.id === member.id);
                              return (
                                <button
                                  key={member.id}
                                  type="button"
                                  onClick={() => handleGroupMemberToggle(member)}
                                  className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                    isSelected ? 'bg-blue-50' : ''
                                  }`}
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
                                      {member.username && (
                                        <div className="text-xs text-gray-500">@{member.username}</div>
                                      )}
                                    </div>
                                    <div className={`w-5 h-5 border-2 rounded ${
                                      isSelected 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isSelected && (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        
                        {selectedGroupMembers.length > 0 && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              Đã chọn {selectedGroupMembers.length} thành viên:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedGroupMembers.map((member) => (
                                <span
                                  key={member.id}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {member.name}
                                  <button
                                    type="button"
                                    onClick={() => handleGroupMemberToggle(member)}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {addMethod === 'ghost' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên thành viên ảo *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên thành viên ảo..."
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email (tùy chọn)
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập email (tùy chọn)..."
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại (tùy chọn)
                      </label>
                      <input
                        id="phone"
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số điện thoại (tùy chọn)..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Đang thêm...' : 'Thêm thành viên'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
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
                    }}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Danh sách thành viên
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  {members.length} thành viên
                </div>
                {showAddButton && (
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
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có thành viên nào</h3>
                <p className="text-gray-600 mb-6">Bắt đầu thêm thành viên cho chuyến đi</p>
                {showAddButton && (
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
                    {members.map((member) => {
                      const isOwnerMember = member.role === 'creator' || member.userId === trip.ownerId;
                      
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
                            {canDelete && !isOwnerMember && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteMember(member.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
      </div>
    </div>
  );
}
