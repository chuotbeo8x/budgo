'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getGroupBySlug, joinGroup, leaveGroup, getGroupMembers, isGroupMember, removeGroupMember } from '@/lib/actions/groups';
import { getGroupTrips } from '@/lib/actions/trips';
import { Group, GroupMember } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import Link from 'next/link';
import GroupTripsTable from '@/components/GroupTripsTable';
import GroupMembersTable from '@/components/GroupMembersTable';
import { 
  Users, 
  Calendar, 
  Settings, 
  UserPlus, 
  Crown, 
  Globe, 
  Lock, 
  Plus,
  BarChart3,
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
  const [isMember, setIsMember] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'members' | 'analytics'>('overview');

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-md">
          {/* Cover Image or Background */}
          {group.coverUrl ? (
            <div className="relative h-64 md:h-80">
              <img 
                src={group.coverUrl} 
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
          )}
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6">
              {/* Group Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              {/* Group Name */}
              <h1 className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                {group.name}
              </h1>
              
              {/* Group Description */}
              {group.description && (
                <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6 drop-shadow-md">
                  {group.description}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                {!isMember ? (
                  <Button 
                    onClick={handleJoin} 
                    disabled={joining}
                    className="bg-white text-gray-900 hover:bg-white/90 font-medium px-6 py-2 rounded-lg shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {joining ? 'Đang tham gia...' : 'Tham gia'}
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={copyInviteLink} 
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-lg"
                    >
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Đã sao chép!' : 'Sao chép link'}
                    </Button>
                    
                    {isOwner && (
                      <Link href={`/g/${group.slug}/manage`}>
                        <Button 
                          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-4 py-2 rounded-lg"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Quản lý
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      onClick={handleLeave} 
                      disabled={leaving}
                      className="bg-red-500/80 hover:bg-red-600/80 text-white px-4 py-2 rounded-lg"
                    >
                      {leaving ? 'Đang rời...' : 'Rời nhóm'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-2 shadow-md border">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
                { id: 'trips', label: 'Chuyến đi', icon: Plane },
                { id: 'members', label: 'Thành viên', icon: Users },
                { id: 'analytics', label: 'Thống kê', icon: PieChart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => setActiveTab(tab.id as any)}
                    className="px-6 py-3 rounded-xl transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Thành viên</p>
                      <p className="text-3xl font-bold">{members.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">Chuyến đi</p>
                      <p className="text-3xl font-bold">{trips.length}</p>
                    </div>
                    <Plane className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">Tổng chi phí</p>
                      <p className="text-3xl font-bold">{totalExpense.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium mb-1">Cấp độ</p>
                      <p className="text-3xl font-bold">{groupLevel.level}</p>
                      <p className="text-orange-200 text-xs mt-1">
                        {groupLevel.level === 'Elite' && 'Nhóm chuyên nghiệp'}
                        {groupLevel.level === 'Pro' && 'Nhóm nâng cao'}
                        {groupLevel.level === 'Active' && 'Nhóm tích cực'}
                        {groupLevel.level === 'Growing' && 'Nhóm phát triển'}
                        {groupLevel.level === 'New' && 'Nhóm mới'}
                      </p>
                    </div>
                    <LevelIcon className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Group Level Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Hệ thống cấp độ nhóm</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Cấp độ được tính dựa trên: số thành viên, số chuyến đi, tổng chi phí và hoạt động gần đây
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">New</div>
                        <div className="text-gray-500">0-19 điểm</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-orange-600">Growing</div>
                        <div className="text-gray-500">20-39 điểm</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-green-600">Active</div>
                        <div className="text-gray-500">40-59 điểm</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-blue-600">Pro</div>
                        <div className="text-gray-500">60-79 điểm</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-purple-600">Elite</div>
                        <div className="text-gray-500">80+ điểm</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Thống kê chuyến đi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chuyến đi đang hoạt động</span>
                      <span className="font-semibold text-green-600">
                        {trips.filter(t => t.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chuyến đi đã đóng</span>
                      <span className="font-semibold text-gray-600">
                        {trips.filter(t => t.status === 'closed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chi phí trung bình</span>
                      <span className="font-semibold text-blue-600">
                        {trips.length > 0 ? Math.round(totalExpense / trips.length).toLocaleString('vi-VN') + 'đ' : '0đ'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Thành viên trung bình</span>
                      <span className="font-semibold text-purple-600">
                        {trips.length > 0 ? Math.round(trips.reduce((sum, trip) => sum + (trip.memberCount || 0), 0) / trips.length) : 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Hoạt động tháng này
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chuyến đi mới</span>
                      <span className="font-semibold text-green-600">
                        {trips.filter(trip => {
                          const tripDate = new Date(trip.createdAt);
                          const now = new Date();
                          return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chi phí tháng này</span>
                      <span className="font-semibold text-blue-600">
                        {trips.filter(trip => {
                          const tripDate = new Date(trip.createdAt);
                          const now = new Date();
                          return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
                        }).reduce((sum, trip) => sum + (trip.totalExpense || 0), 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Thành viên mới</span>
                      <span className="font-semibold text-purple-600">
                        {members.filter(member => {
                          if (!member.joinedAt) return false;
                          const joinDate = new Date(member.joinedAt);
                          const now = new Date();
                          return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tỷ lệ hoàn thành</span>
                      <span className="font-semibold text-orange-600">
                        {trips.length > 0 ? Math.round((trips.filter(t => t.status === 'closed').length / trips.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Hoạt động gần đây
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trips.slice(0, 5).map((trip) => (
                    <div key={trip.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Plane className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{trip.name}</h4>
                        <p className="text-sm text-gray-600">
                          Tạo ngày {formatDate(trip.createdAt)} • {trip.memberCount || 0} thành viên
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {trip.totalExpense ? trip.totalExpense.toLocaleString('vi-VN') + 'đ' : '0đ'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {trip.status === 'active' ? 'Đang hoạt động' : 'Đã đóng'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {trips.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Chưa có hoạt động nào</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trips' && (
          <GroupTripsTable
            trips={trips}
            loading={loadingTrips}
            groupSlug={group.slug}
            groupName={group.name}
            createTripUrl={`/g/${group.slug}/trips/create`}
            createTripLabel="Tạo chuyến đi mới"
            emptyStateTitle="Chưa có chuyến đi nào trong nhóm"
            emptyStateDescription="Tạo chuyến đi mới để bắt đầu quản lý chi phí cùng nhóm"
          />
        )}

        {activeTab === 'members' && (
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
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">Chuyến đi hoạt động</p>
                      <p className="text-3xl font-bold">{activeTrips}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm font-medium mb-1">Chuyến đi hoàn thành</p>
                      <p className="text-3xl font-bold">{completedTrips}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-gray-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Chi phí trung bình</p>
                      <p className="text-3xl font-bold">{averageExpense.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Phân bố chi phí theo chuyến đi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trips.slice(0, 5).map((trip) => (
                      <div key={trip.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 truncate">{trip.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {trip.totalExpense ? trip.totalExpense.toLocaleString('vi-VN') + 'đ' : '0đ'}
                        </span>
                      </div>
                    ))}
                    {trips.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Chưa có dữ liệu phân tích</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Thống kê thành viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tổng thành viên</span>
                      <span className="font-semibold text-gray-900">{members.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Chủ nhóm</span>
                      <span className="font-semibold text-gray-900">
                        {members.filter(m => m.role === 'owner').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Thành viên thường</span>
                      <span className="font-semibold text-gray-900">
                        {members.filter(m => m.role === 'member').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cấp độ nhóm</span>
                      <span className={`font-semibold ${groupLevel.color}`}>
                        {groupLevel.level}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}