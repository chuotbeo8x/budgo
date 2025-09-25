'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  User,
  UserPlus, 
  Copy, 
  Share2, 
  Mail, 
  Phone, 
  Crown, 
  Shield, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserX,
  Settings,
  Eye,
  Star,
  Heart,
  Zap,
  Target,
  Award,
  Trophy,
  Medal,
  Flame,
  Gem,
  Sparkles,
  ThumbsUp,
  Coffee,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Lightbulb,
  Users2,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
  PiggyBank,
  Banknote,
  AlarmClock
} from 'lucide-react';
import { GroupMember } from '@/lib/types';
import { formatDate, toDate } from '@/lib/utils/date';

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

const getTitleInfo = (titleId: string) => {
  return AVAILABLE_TITLES.find(t => t.id === titleId) || {
    id: titleId,
    name: 'Unknown',
    icon: '❓',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  };
};

interface GroupMembersTableProps {
  members: (GroupMember & { 
    name: string; 
    email: string; 
    username: string; 
    avatar: string;
    titleVotes?: { [titleId: string]: number };
    topTitle?: { titleId: string; count: number; latestAt?: Date } | null;
  })[];
  loading: boolean;
  isOwner: boolean;
  currentUserId?: string;
  onCopyInviteLink: () => void;
  onInviteMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
}


export default function GroupMembersTable({
  members,
  loading,
  isOwner,
  currentUserId,
  onCopyInviteLink,
  onInviteMember,
  onRemoveMember
}: GroupMembersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debug: Log members data to check joinedAt
  console.log('GroupMembersTable - members data:', members.map(m => ({
    id: m.id,
    name: m.name,
    joinedAt: m.joinedAt,
    joinedAtType: typeof m.joinedAt
  })));

  const getMemberRole = (member: GroupMember) => {
    if (member.role === 'owner') return { label: 'Chủ nhóm', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Crown };
    return { label: 'Thành viên', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: UserCheck };
  };

  const totalPages = Math.ceil(members.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = members.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
          <Users className="w-8 h-8 text-gray-400 animate-pulse" />
        </div>
        <p className="text-lg text-gray-600">Đang tải danh sách thành viên...</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Chưa có thành viên</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Nhóm này chưa có thành viên nào. Hãy mời bạn bè tham gia để bắt đầu!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={onCopyInviteLink}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Chia sẻ liên kết mời
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ nhóm
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thành viên nhóm</h2>
          <p className="text-gray-600">Quản lý và theo dõi các thành viên trong nhóm</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            {members.length} thành viên
          </div>
          {isOwner && onInviteMember && (
            <Button size="sm" variant="outline" onClick={onInviteMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Mời thêm
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tham gia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh hiệu
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMembers.map((member) => {
                  const roleInfo = getMemberRole(member);
                  const RoleIcon = roleInfo.icon;
                  
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            {member.role === 'owner' && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Crown className="w-1.5 h-1.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="truncate max-w-48">{member.email}</span>
                            </div>
                          )}
                          {(member as any).phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{(member as any).phone}</span>
                            </div>
                          )}
                          {!member.email && !(member as any).phone && (
                            <span className="text-sm text-gray-400">Không có thông tin</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            {member.joinedAt ? (
                              <div>
                                <div className="font-medium">
                                  {formatDate(member.joinedAt)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {(() => {
                                    try {
                                      const joinDate = toDate(member.joinedAt);
                                      const now = new Date();
                                      const diffTime = now.getTime() - joinDate.getTime();
                                      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                      
                                      if (diffDays === 0) return 'Hôm nay';
                                      if (diffDays === 1) return 'Hôm qua';
                                      if (diffDays < 7) return `${diffDays} ngày trước`;
                                      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
                                      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} tháng trước`;
                                      return `${Math.ceil(diffDays / 365)} năm trước`;
                                    } catch (error) {
                                      return 'Không xác định';
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Không xác định</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="space-y-2">
                          {member.topTitle ? (
                            (() => {
                              const info = getTitleInfo(member.topTitle!.titleId);
                              return (
                                <Badge
                                  variant="secondary"
                                  className={`${info.bgColor} ${info.color} border-0 px-2 py-1 text-xs`}
                                >
                                  <span className="mr-1">{info.icon}</span>
                                  {info.name}
                                </Badge>
                              );
                            })()
                          ) : (
                            <span className="text-xs text-gray-400">Chưa có danh hiệu</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(`/profiles/${member.username || member.userId}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Xem trang cá nhân"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isOwner && member.userId !== currentUserId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveMember?.(member.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Xóa khỏi nhóm"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {startIndex + 1} đến {Math.min(endIndex, members.length)} trong tổng số {members.length} thành viên
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
