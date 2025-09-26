'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserGroups, searchPublicGroups, joinGroup } from '@/lib/actions/groups';
import { Group } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import { toast } from 'sonner';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Link from 'next/link';
import { 
  Plus, 
  Users, 
  Calendar, 
  Settings, 
  Eye, 
  Crown, 
  Globe, 
  Lock, 
  Eye as EyeIcon,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  UserPlus,
  BarChart3
} from 'lucide-react';

export default function GroupsManagePage() {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'close' | 'secret'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'members'>('created');
  const [showPublicGroups, setShowPublicGroups] = useState(false);
  const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && user) {
      loadGroups();
    }
  }, [loading, user]);

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      setLoadingGroups(true);
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách nhóm');
    } finally {
      setLoadingGroups(false);
    }
  };

  const searchAllGroups = async () => {
    if (!user || !searchTerm.trim()) return;
    
    try {
      setLoadingPublic(true);
      const results = await searchPublicGroups(searchTerm.trim());
      setPublicGroups(results);
      setShowPublicGroups(true);
    } catch (error) {
      console.error('Error searching groups:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm nhóm');
    } finally {
      setLoadingPublic(false);
    }
  };

  const handleJoinGroup = async (groupId: string, groupName: string) => {
    if (!user) return;
    
    try {
      setJoiningGroups(prev => new Set(prev).add(groupId));
      
      const result = await joinGroup(groupId, user.uid);
      
      if (result.success) {
        toast.success(result.message || `Đã tham gia nhóm "${groupName}" thành công!`);
        // Reload groups to update the list
        await loadGroups();
        // Remove from public groups list since user is now a member
        setPublicGroups(prev => prev.filter(g => g.id !== groupId));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  // Filter and sort groups
  const filteredAndSortedGroups = groups
    .filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || group.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'members':
          return (b.memberCount || 0) - (a.memberCount || 0);
        default:
          return 0;
      }
    });

  const getGroupTypeInfo = (type: string) => {
    switch (type) {
      case 'public':
        return { icon: Globe, label: 'Công khai', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'close':
        return { icon: EyeIcon, label: 'Đóng', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'secret':
        return { icon: Lock, label: 'Bí mật', color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { icon: Globe, label: 'Nhóm', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Đăng nhập để quản lý nhóm của bạn"
        icon={<Users className="w-8 h-8 text-blue-600" />}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý nhóm</h1>
              <p className="text-lg text-gray-600">
                Quản lý tất cả nhóm của bạn một cách dễ dàng
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/groups/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo nhóm mới
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng nhóm</p>
                  <p className="text-3xl font-bold">{groups.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Nhóm công khai</p>
                  <p className="text-3xl font-bold">{groups.filter(g => g.type === 'public').length}</p>
                </div>
                <Globe className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Nhóm đóng</p>
                  <p className="text-3xl font-bold">{groups.filter(g => g.type === 'close').length}</p>
                </div>
                <EyeIcon className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Nhóm bí mật</p>
                  <p className="text-3xl font-bold">{groups.filter(g => g.type === 'secret').length}</p>
                </div>
                <Lock className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm nhóm theo tên hoặc mô tả..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowPublicGroups(false);
                      }}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          // Search in both my groups and public groups
                          await searchAllGroups();
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <Button
                  onClick={searchAllGroups}
                  disabled={!searchTerm.trim() || loadingPublic}
                  className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                >
                  {loadingPublic ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Tìm kiếm
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Lọc và sắp xếp:</span>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="public">Công khai</option>
                  <option value="close">Đóng</option>
                  <option value="secret">Bí mật</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="created">Mới nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="members">Nhiều thành viên</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups List */}
        {loadingGroups ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Đang tải danh sách nhóm...</p>
          </div>
        ) : (showPublicGroups || searchTerm.trim()) ? (
          // Combined Search Results
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kết quả tìm kiếm
              </h2>
              <p className="text-gray-600">
                Tìm thấy {filteredAndSortedGroups.length + publicGroups.length} nhóm cho từ khóa "{searchTerm}"
              </p>
            </div>
            
            {(filteredAndSortedGroups.length === 0 && publicGroups.length === 0) ? (
              <Card className="shadow-md">
                <CardContent className="text-center py-16">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy nhóm nào
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Không có nhóm nào phù hợp với từ khóa "{searchTerm}". Thử từ khóa khác.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* My Groups Section */}
                {filteredAndSortedGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Nhóm của tôi ({filteredAndSortedGroups.length})
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredAndSortedGroups.map((group) => {
                        const typeInfo = getGroupTypeInfo(group.type);
                        const TypeIcon = typeInfo.icon;
                        const isOwner = user?.uid === group.ownerId;
                        
                        return (
                          <Card key={group.id} className="hover:shadow-md transition-all duration-300 bg-white">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                    {group.name}
                                  </CardTitle>
                                  <CardDescription className="text-gray-600 line-clamp-2">
                                    {group.description || 'Không có mô tả'}
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeInfo.label}
                                  </div>
                                  {isOwner && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      <Crown className="w-3 h-3" />
                                      Chủ nhóm
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{group.memberCount || 0} thành viên</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDateTime(group.createdAt)}</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Link href={`/g/${group.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Xem nhóm
                                    </Button>
                                  </Link>
                                  
                                  {isOwner && (
                                    <Link href={`/g/${group.slug}/manage`} className="flex-1">
                                      <Button variant="outline" size="sm" className="w-full">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Quản lý
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Public Groups Section */}
                {publicGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      Nhóm công khai ({publicGroups.length})
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {publicGroups.map((group) => {
                        const typeInfo = getGroupTypeInfo(group.type);
                        const TypeIcon = typeInfo.icon;
                        const isAlreadyMember = groups.some(g => g.id === group.id);
                        
                        return (
                          <Card key={group.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                            <CardHeader className="pb-4">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                    {group.name}
                                  </CardTitle>
                                  <CardDescription className="text-gray-600 line-clamp-2">
                                    {group.description || 'Không có mô tả'}
                                  </CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeInfo.label}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              <div className="space-y-4">
                                {/* Group Stats */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{group.memberCount || 0} thành viên</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDateTime(group.createdAt)}</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Link href={`/g/${group.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Xem nhóm
                                    </Button>
                                  </Link>
                                  {!isAlreadyMember && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleJoinGroup(group.id, group.name)}
                                      disabled={joiningGroups.has(group.id)}
                                    >
                                      {joiningGroups.has(group.id) ? (
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                                      ) : (
                                        <UserPlus className="w-4 h-4 mr-2" />
                                      )}
                                      {joiningGroups.has(group.id) ? 'Đang tham gia...' : 'Tham gia'}
                                    </Button>
                                  )}
                                  {isAlreadyMember && (
                                    <Button variant="outline" size="sm" className="flex-1" disabled>
                                      <Users className="w-4 h-4 mr-2" />
                                      Đã tham gia
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : filteredAndSortedGroups.length === 0 ? (
              <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'Không tìm thấy nhóm' : 'Chưa có nhóm nào'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Bạn chưa tạo hoặc tham gia nhóm nào. Hãy tạo nhóm đầu tiên!'
                }
              </p>
              <Link href="/groups/create">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo nhóm đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedGroups.map((group) => {
              const typeInfo = getGroupTypeInfo(group.type);
              const TypeIcon = typeInfo.icon;
              const isOwner = user?.uid === group.ownerId;
              
              return (
                <Card key={group.id} className="hover:shadow-md transition-all duration-300 bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 line-clamp-2">
                          {group.description || 'Không có mô tả'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </div>
                        {isOwner && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Crown className="w-3 h-3" />
                            Chủ nhóm
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Group Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{group.memberCount || 0} thành viên</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(group.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/g/${group.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            Xem nhóm
                          </Button>
                        </Link>
                        
                        {isOwner && (
                          <Link href={`/g/${group.slug}/manage`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Settings className="w-4 h-4 mr-2" />
                              Quản lý
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {!showPublicGroups && !searchTerm.trim() && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredAndSortedGroups.length} trong tổng số {groups.length} nhóm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
