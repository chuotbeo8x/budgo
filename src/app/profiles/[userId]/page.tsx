'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowLeft,
  Users,
  Plane,
  DollarSign,
  Star,
  TrendingUp,
  Activity,
  Clock,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { getUserProfile, voteForUserTitle, getUserTitleVotes, getUserVotesForTarget } from '@/lib/actions/users';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import LoadingPage from '@/components/ui/loading-page';
import LoadingSpinner from '@/components/ui/loading-spinner';

// Danh hiệu có thể vote
const AVAILABLE_TITLES = [
  { id: 'photographer', name: 'Nhiếp ảnh gia', icon: '📸', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'organizer', name: 'Người tổ chức', icon: '📅', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'foodie', name: 'Tín đồ ẩm thực', icon: '☕', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'navigator', name: 'Hướng dẫn viên', icon: '🗺️', color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'entertainer', name: 'Người vui tính', icon: '🎵', color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { id: 'gamer', name: 'Game thủ', icon: '🎮', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 'scholar', name: 'Học giả', icon: '📚', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'innovator', name: 'Người sáng tạo', icon: '💡', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'socializer', name: 'Người hòa đồng', icon: '👥', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'punctual', name: 'Đúng giờ', icon: '⏰', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 'generous', name: 'Hào phóng', icon: '❤️', color: 'text-red-600', bgColor: 'bg-red-100' },
  { id: 'energetic', name: 'Năng động', icon: '⚡', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  { id: 'focused', name: 'Tập trung', icon: '🎯', color: 'text-teal-600', bgColor: 'bg-teal-100' },
  { id: 'reliable', name: 'Đáng tin cậy', icon: '🛡️', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'leader', name: 'Thủ lĩnh', icon: '🏆', color: 'text-amber-700', bgColor: 'bg-amber-200' },
  { id: 'helper', name: 'Người giúp đỡ', icon: '👍', color: 'text-lime-600', bgColor: 'bg-lime-100' },
  // Expense-related titles
  { id: 'treasurer', name: 'Thủ quỹ', icon: '👛', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  { id: 'deal_hunter', name: 'Săn deal', icon: '💵', color: 'text-green-700', bgColor: 'bg-green-100' },
  { id: 'fast_payer', name: 'Đóng tiền thần tốc', icon: '💳', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { id: 'late_payer', name: 'Chậm đóng tiền', icon: '⏳', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { id: 'budget_master', name: 'Quản lý ngân sách', icon: '💲', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { id: 'treats_team', name: 'Bao cả team', icon: '🐷', color: 'text-rose-700', bgColor: 'bg-rose-100' }
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username: string;
  bio?: string;
  phone?: string;
  location?: string;
  isPublic: boolean;
  createdAt: Date;
  // Stats
  totalTrips: number;
  totalGroups: number;
  totalExpenses: number;
  // Titles
  titles: string[];
  totalVotes: number;
  // Recent activity
  recentTrips: any[];
  userGroups: any[];
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [titleVotes, setTitleVotes] = useState<{ [titleId: string]: number }>({});
  const [userVotedTitles, setUserVotedTitles] = useState<string[]>([]);
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'titles' | 'activity' | 'groups'>('overview');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Try to fetch real user data
        const response = await fetch(`/api/user-profile?userId=${userId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.data);
            
            // Load vote data
            const [votesObj, votedTitles] = await Promise.all([
              getUserTitleVotes(result.data.id),
              currentUser ? getUserVotesForTarget(currentUser.uid, result.data.id) : Promise.resolve([])
            ]);
            setTitleVotes(votesObj || {});
            setUserVotedTitles(votedTitles || []);
          } else {
            setError(result.error || 'Không tìm thấy người dùng');
          }
        } else {
          setError('Có lỗi xảy ra khi tải thông tin người dùng');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Có lỗi xảy ra khi tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId, currentUser]);

  const handleVote = async (titleId: string) => {
    if (!currentUser || !user) return;
    
    try {
      setVoting(prev => new Set(prev).add(titleId));
      
      const result = await voteForUserTitle(currentUser.uid, user.id, titleId);
      
      if (result.success) {
        // Update local state
        const newVotes = { ...titleVotes };
        const newUserVotedTitles = [...userVotedTitles];
        
        if (userVotedTitles.includes(titleId)) {
          // Remove vote
          newVotes[titleId] = Math.max(0, (newVotes[titleId] || 0) - 1);
          setUserVotedTitles(newUserVotedTitles.filter(id => id !== titleId));
          toast.success('Đã bỏ vote danh hiệu');
        } else {
          // Add vote
          newVotes[titleId] = (newVotes[titleId] || 0) + 1;
          setUserVotedTitles([...newUserVotedTitles, titleId]);
          toast.success('Đã vote danh hiệu');
        }
        
        setTitleVotes(newVotes);
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Có lỗi xảy ra khi vote');
    } finally {
      setVoting(prev => {
        const newSet = new Set(prev);
        newSet.delete(titleId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <LoadingPage message="Đang tải thông tin người dùng..." />;
  }

  if (error || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Không tìm thấy người dùng</h2>
              <p className="text-gray-600 mb-8">{error || 'Người dùng không tồn tại hoặc đã bị xóa.'}</p>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{user.name} - Hồ sơ người dùng | Budgo</title>
        <meta name="description" content={`Xem hồ sơ của ${user.name} trên Budgo. Khám phá thông tin, danh hiệu và hoạt động của người dùng này.`} />
        <meta name="keywords" content={`${user.name}, hồ sơ người dùng, budgo, du lịch, nhóm`} />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${user.name} - Hồ sơ người dùng | Budgo`} />
        <meta property="og:description" content={`Xem hồ sơ của ${user.name} trên Budgo. Khám phá thông tin, danh hiệu và hoạt động của người dùng này.`} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
        {user.avatar && <meta property="og:image" content={user.avatar} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${user.name} - Hồ sơ người dùng | Budgo`} />
        <meta name="twitter:description" content={`Xem hồ sơ của ${user.name} trên Budgo. Khám phá thông tin, danh hiệu và hoạt động của người dùng này.`} />
        {user.avatar && <meta name="twitter:image" content={user.avatar} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${typeof window !== 'undefined' ? window.location.href : ''}`} />
      </Head>
      
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-4 sm:mb-6 max-w-6xl mx-auto">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2"/>
              Quay lại
            </Button>
          </Link>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <Card className="bg-white border border-gray-200 shadow-sm mb-6 overflow-hidden">
            <div className="relative h-24 sm:h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative h-full flex items-end pb-4 sm:pb-6 px-4 sm:px-6">
                <div className="flex items-end gap-3 sm:gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="text-white">
                    <h1 className="text-lg sm:text-2xl font-bold mb-1">{user.name}</h1>
                    <p className="text-sm sm:text-base opacity-90">@{user.username}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{user.totalTrips}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Plane className="w-3 h-3" />
                    Chuyến đi
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{user.totalGroups}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" />
                    Nhóm
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                    {user.totalExpenses ? (user.totalExpenses >= 1000000 ? (user.totalExpenses / 1000000).toFixed(1) + 'M' : (user.totalExpenses / 1000).toFixed(0) + 'K') : '0'}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Chi phí
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600 mb-1">{Object.values(titleVotes).reduce((sum, v) => sum + (v || 0), 0)}</div>
                  <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Star className="w-3 h-3" />
                    Vote
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex flex-wrap gap-2 sm:gap-0 sm:space-x-8">
                  {[
                    { id: 'overview', label: 'Tổng quan', icon: Activity },
                    { id: 'titles', label: 'Danh hiệu', icon: Star },
                    { id: 'activity', label: 'Hoạt động', icon: TrendingUp },
                    { id: 'groups', label: 'Nhóm', icon: Users }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </Card>

          {/* Tab Content */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Bio */}
                  {user.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Giới thiệu</h3>
                      <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Điện thoại</p>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Địa điểm</p>
                            <p className="font-medium">{user.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Tham gia từ</p>
                          <p className="font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Titles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Danh hiệu hiện tại</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(titleVotes)
                        .filter(([_, count]) => count > 0)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 6)
                        .map(([titleId, count]) => {
                          const title = AVAILABLE_TITLES.find(t => t.id === titleId);
                          if (!title) return null;
                          
                          return (
                            <Badge 
                              key={titleId}
                              variant="secondary"
                              className={`${title.bgColor} ${title.color} border-0 px-3 py-1`}
                            >
                              <span className="mr-1">{title.icon}</span>
                              {title.name} ({count})
                            </Badge>
                          );
                        })}
                      {Object.keys(titleVotes).filter(id => titleVotes[id] > 0).length === 0 && (
                        <p className="text-gray-500 text-sm">Chưa có danh hiệu nào</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'titles' && (
                <div className="space-y-6">
                  {/* Current Titles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh hiệu hiện tại</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(titleVotes)
                        .filter(([_, count]) => count > 0)
                        .sort(([, a], [, b]) => b - a)
                        .map(([titleId, count]) => {
                          const title = AVAILABLE_TITLES.find(t => t.id === titleId);
                          if (!title) return null;
                          
                          return (
                            <Badge 
                              key={titleId}
                              variant="secondary"
                              className={`${title.bgColor} ${title.color} border-0 px-3 py-1`}
                            >
                              <span className="mr-1">{title.icon}</span>
                              {title.name} ({count})
                            </Badge>
                          );
                        })}
                      {Object.keys(titleVotes).filter(id => titleVotes[id] > 0).length === 0 && (
                        <p className="text-gray-500 text-sm">Chưa có danh hiệu nào</p>
                      )}
                    </div>
                  </div>

                  {/* Vote Section */}
                  {currentUser && currentUser.uid !== user.id && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Vote danh hiệu cho {user.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {AVAILABLE_TITLES.map((title) => {
                          const isVoted = userVotedTitles.includes(title.id);
                          const isVoting = voting.has(title.id);
                          const voteCount = titleVotes[title.id] || 0;
                          
                          return (
                            <button
                              key={title.id}
                              onClick={() => handleVote(title.id)}
                              disabled={isVoting}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                isVoted
                                  ? `${title.bgColor} ${title.color} border-current`
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              } ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <div className="text-center">
                                {isVoting ? (
                                  <div className="flex items-center justify-center mb-1">
                                    <LoadingSpinner size="sm" color="primary" />
                                  </div>
                                ) : (
                                  <div className="text-2xl mb-1">{title.icon}</div>
                                )}
                                <div className="text-sm font-medium mb-1">{title.name}</div>
                                <div className="text-xs text-gray-500">{voteCount} vote{voteCount !== 1 ? 's' : ''}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentUser && currentUser.uid === user.id && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Không thể vote chính mình</p>
                    </div>
                  )}

                  {!currentUser && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Vui lòng đăng nhập để vote danh hiệu</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
                  
                  {user.recentTrips && user.recentTrips.length > 0 ? (
                    <div className="space-y-4">
                      {user.recentTrips.slice(0, 5).map((trip: any, index: number) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Plane className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{trip.name}</h4>
                              <p className="text-sm text-gray-600">
                                {trip.startDate && formatDate(trip.startDate)} - {trip.endDate && formatDate(trip.endDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {trip.totalExpense ? (trip.totalExpense >= 1000000 ? (trip.totalExpense / 1000000).toFixed(1) + 'M' : (trip.totalExpense / 1000).toFixed(0) + 'K') : '0'} VNĐ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Chưa có hoạt động nào</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'groups' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhóm tham gia</h3>
                  
                  {user.userGroups && user.userGroups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.userGroups.slice(0, 6).map((group: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">{group.name}</h4>
                          {group.description && (
                            <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.memberCount || 0} thành viên
                            </span>
                            <span className="flex items-center gap-1">
                              <Plane className="w-3 h-3" />
                              {group.tripCount || 0} chuyến đi
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Chưa tham gia nhóm nào</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
    </>
  );
}