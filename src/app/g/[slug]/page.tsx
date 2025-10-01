'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import Head from 'next/head';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getGroupBySlug, joinGroup, leaveGroup, getGroupMembers, isGroupMember, removeGroupMember } from '@/lib/actions/groups';
import { getGroupTrips } from '@/lib/actions/trips';
import { createGroupPost, getGroupPosts, likeGroupPost, getPostLikes, createGroupComment, getGroupComments } from '@/lib/actions/posts';
import { getGroupActivities } from '@/lib/actions/activities';
import { Group, GroupMember, GroupPost, GroupActivity } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import GroupTripsTable from '@/components/GroupTripsTable';
import GroupMembersTable from '@/components/GroupMembersTable';
import TripCreateModal from '@/components/modals/TripCreateModal';
import { 
  Users, 
  Calendar, 
  Settings, 
  UserPlus, 
  Crown, 
  Globe, 
  Lock, 
  Plus,
  Copy,
  Check,
  UserCheck,
  Mail,
  Phone,
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Activity,
  Zap,
  Heart,
  Share2,
  MoreVertical,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Bell,
  FileText,
  Image,
  Video,
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  Eye,
  EyeOff,
  UserX,
  UserMinus,
  Award,
  Target,
  PieChart,
  DollarSign,
  CreditCard,
  Receipt,
  Plane,
  Car,
  Home,
  Building
} from 'lucide-react';

export default function GroupPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'trips' | 'members'>('feed');
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    if (slug && user) {
      loadGroup();
    }
  }, [slug, user]);

  useEffect(() => {
    if (group && user) {
      checkMembership();
      loadTrips();
      loadMembers();
      // Load posts and activities with small delay to avoid race conditions
      setTimeout(() => {
        loadPosts();
        loadActivities();
      }, 100);
    }
  }, [group, user]);

  const loadGroup = async () => {
    try {
      setLoadingGroup(true);
      const groupData = await getGroupBySlug(slug as string);
      setGroup(groupData);
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setLoadingGroup(false);
    }
  };

  const checkMembership = async () => {
    if (!group || !user) return;
    
    try {
      const member = await isGroupMember(group.id, user.uid);
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const loadTrips = async () => {
    if (!group) return;
    
    try {
      setLoadingTrips(true);
      const tripsData = await getGroupTrips(group.id);
      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadMembers = async () => {
    if (!group) return;
    
    try {
      setLoadingMembers(true);
      const membersData = await getGroupMembers(group.id);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách thành viên');
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadPosts = async () => {
    if (!group) return;
    
    try {
      console.log('Loading posts for group:', group.id);
      setLoadingPosts(true);
      const { posts: postsData } = await getGroupPosts(group.id);
      console.log('Posts loaded:', postsData.length);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async () => {
    if (!group || !user || !postContent.trim()) return;
    
    try {
      setPosting(true);
      await createGroupPost(group.id, user.uid, postContent);
      setPostContent('');
      toast.success('Đã đăng bài viết');
      loadPosts(); // Reload posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng bài');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      console.log('Attempting to like post:', postId);
      console.log('User ID:', user.uid);
      console.log('User object:', user);
      
      const result = await likeGroupPost(postId, user.uid);
      console.log('Like result:', result);
      
      if (result.success) {
        loadPosts(); // Reload posts to update like count
      } else if (result.message) {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      console.error('Error details:', error);
      toast.error('Có lỗi xảy ra khi thích bài viết');
    }
  };

  const handleCommentPost = async (postId: string) => {
    if (!user) return;
    
    setSelectedPostId(postId);
    setCommentText('');
    setCommentModalOpen(true);
  };

  const handleSubmitComment = async () => {
    if (!selectedPostId || !user || !commentText.trim()) return;
    
    try {
      setCommenting(true);
      await createGroupComment(selectedPostId, user.uid, commentText);
      toast.success('Đã gửi bình luận');
      setCommentModalOpen(false);
      setCommentText('');
      loadPosts(); // Reload posts to update comment count
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi bình luận');
    } finally {
      setCommenting(false);
    }
  };

  const loadActivities = async () => {
    if (!group) return; // prevent if no group yet
    try {
      console.log('Loading activities for group:', group.id);
      setLoadingActivities(true);
      const { activities } = await getGroupActivities(group.id);
      console.log('Activities loaded:', activities.length);
      setActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      // Silent fail; activity feed is optional
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleJoin = async () => {
    if (!group || !user) return;
    
    try {
      setJoining(true);
      await joinGroup(group.id, user.uid);
      toast.success('Tham gia nhóm thành công');
      setIsMember(true);
      loadMembers();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Có lỗi xảy ra khi tham gia nhóm');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!group || !user) return;
    
    try {
      setLeaving(true);
      await leaveGroup(group.id, user.uid);
      toast.success('Rời nhóm thành công');
      setIsMember(false);
      loadMembers();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Có lỗi xảy ra khi rời nhóm');
    } finally {
      setLeaving(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/g/${group?.slug}/invites`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success('Đã sao chép liên kết mời');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying invite link:', error);
      toast.error('Có lỗi xảy ra khi sao chép liên kết');
    }
  };

  const getGroupLevel = (memberCount: number, tripCount: number, totalExpense: number) => {
    // Tính điểm dựa trên nhiều yếu tố
    let score = 0;
    
    // Điểm từ số thành viên (0-30 điểm)
    score += Math.min(memberCount * 2, 30);
    
    // Điểm từ số chuyến đi (0-25 điểm)
    score += Math.min(tripCount * 3, 25);
    
    // Điểm từ tổng chi phí (0-25 điểm) - 1 triệu = 1 điểm
    score += Math.min(Math.floor(totalExpense / 1000000), 25);
    
    // Điểm từ hoạt động gần đây (0-20 điểm)
    const recentTrips = trips.filter(trip => {
      const tripDate = new Date(trip.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - tripDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // 30 ngày gần đây
    }).length;
    score += Math.min(recentTrips * 2, 20);
    
    // Xác định cấp độ dựa trên tổng điểm
    if (score >= 80) return { level: 'Elite', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Crown };
    if (score >= 60) return { level: 'Pro', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Star };
    if (score >= 40) return { level: 'Active', color: 'text-green-600', bgColor: 'bg-green-100', icon: TrendingUp };
    if (score >= 20) return { level: 'Growing', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Activity };
    return { level: 'New', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Target };
  };

  const getMemberRole = (member: GroupMember) => {
    if (member.role === 'owner') return { label: 'Chủ nhóm', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Crown };
    return { label: 'Thành viên', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: UserCheck };
  };

  if (loading || loadingGroup) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 animate-pulse">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang tải thông tin nhóm...</h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy nhóm</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Nhóm bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
              <Link href="/groups/search">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Tìm nhóm khác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate analytics
  const totalExpense = trips.reduce((sum, trip) => sum + (trip.totalExpense || 0), 0);
  
  const isOwner = user?.uid === group.ownerId;
  const groupLevel = getGroupLevel(members.length, trips.length, totalExpense);
  const LevelIcon = groupLevel.icon;
  const averageExpense = trips.length > 0 ? totalExpense / trips.length : 0;
  const activeTrips = trips.filter(trip => trip.status === 'active').length;
  const completedTrips = trips.filter(trip => trip.status === 'closed').length;

  return (
    <>
      <Head>
        <title>{group.name} - Budgo</title>
        <meta name="description" content={group.description || `Tham gia nhóm ${group.name} để quản lý chuyến đi và chia sẻ chi phí cùng bạn bè.`} />
        <meta name="keywords" content={`${group.name}, nhóm du lịch, quản lý chuyến đi, chia sẻ chi phí, budgo`} />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content={`${group.name} - Budgo`} />
        <meta property="og:description" content={group.description || `Tham gia nhóm ${group.name} để quản lý chuyến đi và chia sẻ chi phí cùng bạn bè.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={`${group.name} - Budgo`} />
        <meta name="twitter:description" content={group.description || `Tham gia nhóm ${group.name} để quản lý chuyến đi và chia sẻ chi phí cùng bạn bè.`} />
        <link rel="canonical" href={`https://budgo.app/g/${group.slug}`} />
      </Head>
      
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Social Media Style Header - SEO optimized */}
        <header className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 lg:mb-8 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-40 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 relative">
            {group.coverUrl && (
              <img 
                src={group.coverUrl} 
                alt={group.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>
          </div>
          
          {/* Profile Section */}
          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row gap-4 -mt-8">
              {/* Group Avatar */}
              <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center relative z-10">
                <Users className="w-10 h-10 text-primary-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">{group.name}</h1>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1" aria-label={`${members.length} thành viên`}>
                        <Users className="w-4 h-4" aria-hidden="true" />
                        {members.length} thành viên
                      </span>
                      <span className="flex items-center gap-1" aria-label={`${trips.length} chuyến đi`}>
                        <Plane className="w-4 h-4" aria-hidden="true" />
                        {trips.length} chuyến đi
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!isMember ? (
                      <Button 
                        onClick={handleJoin} 
                        disabled={joining}
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {joining ? 'Đang tham gia...' : 'Tham gia nhóm'}
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={copyInviteLink} 
                          variant="outline"
                          size="sm"
                        >
                          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copied ? 'Đã sao chép!' : 'Mời bạn bè'}
                        </Button>
                        
                        {isOwner && (
                          <Link href={`/g/${group.slug}/manage`}>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Quản lý
                            </Button>
                          </Link>
                        )}
                        
                        <Button 
                          onClick={handleLeave} 
                          disabled={leaving}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {leaving ? 'Đang rời...' : 'Rời nhóm'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Social Media Style Tab Navigation - SEO optimized */}
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 lg:mb-8" role="tablist" aria-label="Điều hướng nhóm">
          <div className="flex border-b">
            {[
              { id: 'feed', label: 'Bảng tin', icon: Activity },
              { id: 'trips', label: 'Chuyến đi', icon: Plane },
              { id: 'members', label: 'Thành viên', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id as any)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  className={`flex-1 rounded-none border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-primary-500 text-primary-600 bg-primary-50' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content - SEO optimized */}
        <main role="main" aria-label="Nội dung nhóm">
          {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Create Post */}
            {isMember && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        placeholder="Chia sẻ gì đó với nhóm..."
                        className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        disabled={posting}
                      />
                      <div className="flex justify-end mt-4">
                        <Button 
                          size="sm" 
                          onClick={handleCreatePost}
                          disabled={posting || !postContent.trim()}
                        >
                          {posting ? 'Đang đăng...' : 'Đăng'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feed: Posts and Activities */}
            <div className="space-y-4 lg:space-y-6">
              {loadingPosts || loadingActivities ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-500">Đang tải bài viết...</p>
                </div>
              ) : posts.length === 0 && activities.length === 0 ? (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
                  <p className="text-sm lg:text-base text-gray-500">Hãy là người đầu tiên chia sẻ với nhóm!</p>
                </div>
              ) : (
                // Merge posts and activities, sort by date
                [...activities.map(a => ({ type: 'activity' as const, createdAt: a.createdAt, data: a })),
                 ...posts.map(p => ({ type: 'post' as const, createdAt: p.createdAt, data: p }))]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((item, index) => item.type === 'post' ? (
                  // Post card
                  <Card key={`post-${(item.data as GroupPost).id}`} className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          {(item.data as GroupPost).authorAvatar ? (
                            <img 
                              src={(item.data as GroupPost).authorAvatar!} 
                              alt={(item.data as GroupPost).authorName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-primary-600" aria-hidden="true" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{(item.data as GroupPost).authorName}</h4>
                            <span className="text-xs text-gray-500">
                              {formatDate((item.data as GroupPost).createdAt)}
                            </span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-600 whitespace-pre-wrap">{(item.data as GroupPost).content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-primary-600"
                          onClick={() => handleLikePost((item.data as GroupPost).id)}
                        >
                          <Heart className="w-4 h-4 mr-1" aria-hidden="true" />
                          {(item.data as GroupPost).likesCount} thích
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-primary-600"
                          onClick={() => handleCommentPost((item.data as GroupPost).id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" aria-hidden="true" />
                          {(item.data as GroupPost).commentsCount} bình luận
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // Activity card
                  <Card key={`activity-${(item.data as GroupActivity).id}`} className="bg-white border border-gray-200 shadow-sm">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Activity className="w-5 h-5 text-gray-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {(item.data as GroupActivity).type === 'trip_created' && 'Chuyến đi mới'}
                              {(item.data as GroupActivity).type === 'member_joined' && 'Thành viên mới'}
                              {(item.data as GroupActivity).type === 'expense_added' && 'Chi phí mới'}
                              {(item.data as GroupActivity).type === 'advance_added' && 'Tạm ứng mới'}
                              {(item.data as GroupActivity).type === 'settlement_ready' && 'Đối soát sẵn sàng'}
                            </h4>
                            <span className="text-xs text-gray-500">{formatDate((item.data as GroupActivity).createdAt)}</span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-600">
                            {(() => {
                              const a = item.data as GroupActivity;
                              switch (a.type) {
                                case 'trip_created':
                                  return <>Đã tạo chuyến đi "{a.payload?.tripName}"</>;
                                case 'member_joined':
                                  return <>{a.payload?.memberName} đã tham gia nhóm</>;
                                case 'expense_added':
                                  return <>Thêm chi phí: {a.payload?.expenseDescription} ({a.payload?.amount?.toLocaleString('vi-VN')} {a.payload?.currency})</>;
                                case 'advance_added':
                                  return <>Thêm tạm ứng: {a.payload?.amount?.toLocaleString('vi-VN')} {a.payload?.currency}</>;
                                case 'settlement_ready':
                                  return <>Đã tạo bảng đối soát</>;
                                default:
                                  return null;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

          {activeTab === 'trips' && (
            <section role="tabpanel" id="trips-panel" aria-labelledby="trips-tab" className="space-y-4 lg:space-y-6">
              {/* Trips Header */}
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Chuyến đi của nhóm</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {trips.length} chuyến đi • {activeTrips} đang diễn ra • {completedTrips} đã hoàn thành
                  </p>
                </div>
                <TripCreateModal
                  trigger={
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo chuyến đi
                    </Button>
                  }
                  groups={[group]}
                  onSuccess={(tripId, groupId, tripSlug) => {
                    toast.success('Chuyến đi đã được tạo thành công!');
                    if (tripSlug) {
                      window.location.reload();
                    }
                  }}
                />
              </div>

              {/* Trips Content */}
              <GroupTripsTable
                trips={trips}
                loading={loadingTrips}
                groupSlug={group.slug}
                groupName={group.name}
                createTripUrl={`/g/${group.slug}/trips`}
                createTripLabel="Tạo chuyến đi mới"
                emptyStateTitle="Chưa có chuyến đi nào trong nhóm"
                emptyStateDescription="Tạo chuyến đi mới để bắt đầu quản lý chi phí cùng nhóm"
              />
            </section>
          )}

          {activeTab === 'members' && (
            <section role="tabpanel" id="members-panel" aria-labelledby="members-tab" className="space-y-4 lg:space-y-6">
              {/* Members Header */}
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div>
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Thành viên nhóm</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {members.length} thành viên • {members.filter(m => m.role === 'owner').length} chủ nhóm
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Mời thành viên
                </Button>
              </div>

              {/* Members Content */}
              <GroupMembersTable
                members={members as (GroupMember & { name: string; email: string; username: string; avatar: string; titleVotes?: { [titleId: string]: number }; topTitle?: { titleId: string; count: number; latestAt?: Date } | null })[]}
                loading={loadingMembers}
                isOwner={isOwner}
                currentUserId={user?.uid}
                onCopyInviteLink={copyInviteLink}
                onInviteMember={() => {
                  // TODO: Implement invite member functionality
                  console.log('Invite member clicked');
                }}
                onRemoveMember={async (memberId) => {
                  if (!user || !group) return;
                  try {
                    await removeGroupMember(group.id, memberId, user.uid);
                    toast.success('Đã xóa thành viên khỏi nhóm');
                    await loadMembers();
                  } catch (error) {
                    console.error('Error removing member:', error);
                    toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa thành viên');
                  }
                }}
              />
            </section>
          )}
        </main>

        </div>
      </div>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bình luận</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              placeholder="Nhập bình luận của bạn..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={commenting}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCommentModalOpen(false)}
                disabled={commenting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={commenting || !commentText.trim()}
                size="sm"
              >
                {commenting ? 'Đang gửi...' : 'Gửi'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  );
}