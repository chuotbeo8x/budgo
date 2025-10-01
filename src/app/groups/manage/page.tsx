'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Head from 'next/head';
import Footer from '@/components/Footer';
import LoadingPage from '@/components/ui/loading-page';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
  BarChart3,
  Home
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
        return { icon: Globe, label: 'Công khai', color: 'text-green-700', bgColor: 'bg-green-100' };
      case 'close':
        return { icon: EyeIcon, label: 'Đóng', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'secret':
        return { icon: Lock, label: 'Bí mật', color: 'text-green-800', bgColor: 'bg-green-200' };
      default:
        return { icon: Globe, label: 'Nhóm', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  if (loading) {
    return <LoadingPage message="Đang tải thông tin nhóm..." />;
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Đăng nhập để quản lý nhóm của bạn"
        icon={<Users className="w-8 h-8 text-green-600" />}
      />
    );
  }

  return (
    <>
      <Head>
        <title>Quản lý nhóm - Budgo</title>
        <meta name="description" content="Quản lý tất cả nhóm của bạn một cách dễ dàng. Tạo nhóm, tham gia nhóm công khai và quản lý thành viên." />
        <meta name="keywords" content="quản lý nhóm, nhóm du lịch, tạo nhóm, tham gia nhóm, budgo" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="Quản lý nhóm - Budgo" />
        <meta property="og:description" content="Quản lý tất cả nhóm của bạn một cách dễ dàng" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Quản lý nhóm - Budgo" />
        <meta name="twitter:description" content="Quản lý tất cả nhóm của bạn một cách dễ dàng" />
        <link rel="canonical" href="https://budgo.app/groups/manage" />
      </Head>
      
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header Section - SEO optimized */}
        <header className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Quản lý nhóm</h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý tất cả nhóm của bạn một cách dễ dàng
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Link href="/groups/create">
                <Button size="sm" variant="success" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo nhóm mới
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Search and Stats Section - SEO optimized */}
        <section className="mb-6 lg:mb-8" aria-label="Thống kê và tìm kiếm nhóm">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-4">
                {/* Stats Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 sm:gap-4">
                  <article className="flex items-center gap-2" aria-label="Tổng số nhóm">
                    <Users className="w-4 h-4 text-green-600" aria-hidden="true" />
                    <span className="text-sm text-gray-600">Tổng:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-green-600" aria-label={`${groups.length} nhóm`}>{groups.length}</span>
                  </article>
                  <article className="flex items-center gap-2" aria-label="Số nhóm công khai">
                    <Globe className="w-4 h-4 text-green-500" aria-hidden="true" />
                    <span className="text-sm text-gray-600">Công khai:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-green-500" aria-label={`${groups.filter(g => g.type === 'public').length} nhóm công khai`}>{groups.filter(g => g.type === 'public').length}</span>
                  </article>
                </div>
              </div>

              {/* Search */}
              <div className="w-full">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={searchAllGroups}
                    disabled={!searchTerm.trim() || loadingPublic}
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {loadingPublic ? (
                      <LoadingSpinner size="sm" color="gray" className="mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Tìm kiếm
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Lọc và sắp xếp:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as 'all' | 'public' | 'close' | 'secret')}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">Tất cả loại</option>
                      <option value="public">Công khai</option>
                      <option value="close">Đóng</option>
                      <option value="secret">Bí mật</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'created' | 'name' | 'members')}
                      className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="created">Mới nhất</option>
                      <option value="name">Tên A-Z</option>
                      <option value="members">Nhiều thành viên</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </section>

        {/* Groups List - SEO optimized */}
        <main role="main" aria-label="Danh sách nhóm">
          {loadingGroups ? (
            <div className="text-center py-8 sm:py-12">
              <LoadingSpinner size="lg" color="green" className="mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">Đang tải danh sách nhóm...</p>
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
              <Card className="shadow-sm">
                <CardContent className="text-center py-8 sm:py-12">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy nhóm nào
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                    Không có nhóm nào phù hợp với từ khóa "{searchTerm}". Thử từ khóa khác.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* My Groups Section */}
                {filteredAndSortedGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" aria-hidden="true" />
                      Nhóm của tôi ({filteredAndSortedGroups.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                      {filteredAndSortedGroups.map((group) => {
                        const typeInfo = getGroupTypeInfo(group.type);
                        const TypeIcon = typeInfo.icon;
                        const isOwner = user?.uid === group.ownerId;
                        
                        return (
                          <Card key={group.id} className="hover:shadow-md transition-all duration-300 bg-white">
                            <CardContent className="p-3 md:p-4 lg:p-6">
                              <div className="space-y-3 sm:space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                      {group.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {group.description || 'Không có mô tả'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 ml-2">
                                    <div className={`flex sm:inline-flex flex-wrap whitespace-normal items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                                      <TypeIcon className="w-3 h-3" />
                                      <span className="hidden sm:inline">{typeInfo.label}</span>
                                      <span className="sm:hidden whitespace-normal">{typeInfo.label}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Group Info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{group.memberCount || 0} thành viên</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{formatDateTime(group.createdAt)}</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Link href={`/g/${group.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Xem
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
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4 lg:mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-500" aria-hidden="true" />
                      Nhóm công khai ({publicGroups.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                      {publicGroups.map((group) => {
                        const typeInfo = getGroupTypeInfo(group.type);
                        const TypeIcon = typeInfo.icon;
                        const isAlreadyMember = groups.some(g => g.id === group.id);
                        
                        return (
                          <Card key={group.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                            <CardContent className="p-3 sm:p-4">
                              <div className="space-y-3 sm:space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                      {group.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {group.description || 'Không có mô tả'}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 ml-2">
                                    <div className={`flex sm:inline-flex flex-wrap whitespace-normal items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                                      <TypeIcon className="w-3 h-3" />
                                      <span className="hidden sm:inline">{typeInfo.label}</span>
                                      <span className="sm:hidden whitespace-normal">{typeInfo.label}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Group Info */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{group.memberCount || 0} thành viên</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>{formatDateTime(group.createdAt)}</span>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <Link href={`/g/${group.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Xem
                                    </Button>
                                  </Link>
                                  {!isAlreadyMember && (
                                    <Button 
                                      variant="success" 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={() => handleJoinGroup(group.id, group.name)}
                                      disabled={joiningGroups.has(group.id)}
                                    >
                                      {joiningGroups.has(group.id) ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
              <Card className="shadow-sm">
            <CardContent className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'Không tìm thấy nhóm' : 'Chưa có nhóm nào'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== 'all' 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Bạn chưa tạo hoặc tham gia nhóm nào. Hãy tạo nhóm đầu tiên!'
                }
              </p>
              <Link href="/groups/create">
                <Button size="lg" variant="success" className="h-8 sm:h-10 text-xs sm:text-sm">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Tạo nhóm đầu tiên
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedGroups.map((group) => {
              const typeInfo = getGroupTypeInfo(group.type);
              const TypeIcon = typeInfo.icon;
              const isOwner = user?.uid === group.ownerId;
              
              return (
                <Card key={group.id} className="hover:shadow-md transition-all duration-300 bg-white">
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {group.description || 'Không có mô tả'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <div className={`flex sm:inline-flex flex-wrap whitespace-normal items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{typeInfo.label}</span>
                            <span className="sm:hidden whitespace-normal">{typeInfo.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Group Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{group.memberCount || 0} thành viên</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{formatDateTime(group.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/g/${group.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Xem
                          </Button>
                        </Link>
                        
                        {isOwner && (
                          <Link href={`/g/${group.slug}/manage`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                              <Settings className="w-3 h-3 mr-1" />
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
          <div className="mt-6 lg:mt-8 text-center">
            <p className="text-sm text-gray-600">
              Hiển thị {filteredAndSortedGroups.length} trong tổng số {groups.length} nhóm
            </p>
          </div>
        )}
        </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
