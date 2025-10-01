'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserGroups } from '@/lib/actions/groups';
import { Group } from '@/lib/types';
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Bell, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import TripCreateModal from '@/components/modals/TripCreateModal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WelcomePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Mark that user has seen welcome page when component mounts
  useEffect(() => {
    if (user && profile && typeof window !== 'undefined') {
      localStorage.setItem(`budgo_welcome_seen_${user.uid}`, 'true');
    }
  }, [user, profile]);

  // Load groups for trip creation modal
  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      if (!user?.uid) {
        console.warn('No user ID available for loading groups');
        return;
      }
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
      console.log('Loaded groups for welcome page:', userGroups.length);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    if (user && typeof window !== 'undefined') {
      // Ensure welcome flag is set before navigating
      localStorage.setItem(`budgo_welcome_seen_${user.uid}`, 'true');
      router.push('/dashboard');
    }
  };

  // Handle navigation to help page
  const handleGoToHelp = () => {
    router.push('/help');
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary-600" />,
      title: "Quản lý nhóm thông minh",
      description: "Tạo nhóm Public, Close hoặc Secret. Mời bạn bè và quản lý quyền hạn dễ dàng.",
      benefits: ["3 loại nhóm linh hoạt", "Mời bạn bè nhanh chóng", "Phân quyền rõ ràng"]
    },
    {
      icon: <MapPin className="w-6 h-6 text-success-600" />,
      title: "Lập kế hoạch chuyến đi",
      description: "Tạo chuyến đi cá nhân hoặc nhóm với thông tin chi tiết và đa tiền tệ.",
      benefits: ["Chuyến đi cá nhân & nhóm", "Hỗ trợ VND & USD", "Ghi chú đầy đủ"]
    },
    {
      icon: <DollarSign className="w-6 h-6 text-warning-600" />,
      title: "Chia sẻ chi phí minh bạch",
      description: "Ghi nhận chi phí, chia đều hoặc theo trọng số, quản lý tạm ứng và quyết toán tự động.",
      benefits: ["Chia đều hoặc theo trọng số", "Quản lý tạm ứng", "Quyết toán tự động"]
    },
    {
      icon: <Bell className="w-6 h-6 text-gray-700" />,
      title: "Thông báo thông minh",
      description: "Nhận thông báo real-time về mọi hoạt động trong nhóm và chuyến đi.",
      benefits: ["Cập nhật real-time", "Đa dạng loại thông báo", "Quản lý trạng thái"]
    }
  ];

  const quickActions = [
    {
      title: "Tạo nhóm đầu tiên",
      description: "Bắt đầu với việc tạo nhóm để mời bạn bè",
      action: "Tạo nhóm",
      href: "/groups/create",
      variant: "default" as const,
    },
    {
      title: "Lập kế hoạch chuyến đi",
      description: "Tạo chuyến đi cá nhân hoặc thuộc nhóm",
      action: "Tạo chuyến đi",
      href: "/trips/create",
      variant: "default" as const,
    },
    {
      title: "Khám phá dashboard",
      description: "Xem tổng quan và quản lý tất cả",
      action: "Vào dashboard",
      href: "/dashboard",
      variant: "outline" as const,
    }
  ];

  return (
    // Design System: Clean background, responsive spacing
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12 max-w-6xl">
        {/* Header - Design System Typography */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            🎉 Chào mừng đến với Budgo!
          </h1>
          <p className="text-base lg:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Xin chào <span className="font-semibold text-primary-600">{profile.name}</span>! 
            Chúng tôi rất vui mừng chào đón bạn đến với cộng đồng quản lý nhóm và chuyến đi.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            <Star className="w-4 h-4" />
            Thành viên mới
          </Badge>
        </div>

        {/* Features Overview - Design System: Responsive grid */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
            🌟 Khám phá những tính năng tuyệt vời
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions - Design System: Responsive grid */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
            🚀 Bắt đầu ngay hôm nay
          </h2>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="h-full group hover:-translate-y-1 transition-all duration-200">
                <CardHeader>
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {action.href === '/trips/create' ? (
                    <TripCreateModal
                      trigger={
                        <Button variant="outline" className="w-full">
                          {action.action}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      }
                      groups={groups}
                      onSuccess={(tripId, groupId, tripSlug) => {
                        if (groupId) {
                          const group = groups.find(g => g.id === groupId);
                          if (group) {
                            router.push(`/g/${group.slug}/trips/${tripSlug}/manage`);
                          } else {
                            router.push(`/trips/${tripSlug}/manage`);
                          }
                        } else {
                          router.push(`/trips/${tripSlug}/manage`);
                        }
                      }}
                    />
                  ) : (
                    <Link href={action.href}>
                      <Button variant="outline" className="w-full">
                        {action.action}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips & Best Practices - Design System: Semantic colors */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
            💡 Mẹo sử dụng hiệu quả
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Tạo nhóm phù hợp</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Chọn loại nhóm phù hợp: Public cho cộng đồng, Close cho bạn bè, Secret cho riêng tư.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-success-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Chia sẻ chi phí thông minh</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Sử dụng &quot;Chia đều&quot; khi mọi người tham gia đầy đủ, &quot;Theo trọng số&quot; khi có sự khác biệt.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-warning-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Theo dõi thông báo</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Kiểm tra thông báo thường xuyên để không bỏ lỡ cập nhật quan trọng từ nhóm.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security & Support - Design System: Clean cards */}
        <div className="mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-8 lg:mb-12">
            🛡️ Bảo mật & Hỗ trợ
          </h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-gray-700" />
                  <CardTitle>Bảo mật tuyệt đối</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Xác thực Google an toàn</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Mã hóa dữ liệu bảo mật</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Kiểm soát quyền truy cập</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Không chia sẻ thông tin cá nhân</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-gray-700" />
                  <CardTitle>Đa nền tảng</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Hoạt động trên mọi thiết bị</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Đồng bộ real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Giao diện thân thiện</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                    <span>Tốc độ nhanh chóng</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action - Design System: Clean CTA */}
        <div className="text-center">
          <Card className="bg-gray-100 border-gray-200">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
                🎊 Chúc bạn có những trải nghiệm tuyệt vời!
              </h3>
              <p className="text-base lg:text-lg mb-8 text-gray-600 max-w-2xl mx-auto">
                Budgo được thiết kế để làm cho việc quản lý nhóm và chuyến đi trở nên đơn giản, minh bạch và thú vị.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="default"
                  onClick={handleGoToDashboard}
                >
                  Vào Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleGoToHelp}
                >
                  Xem hướng dẫn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

