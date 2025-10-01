'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Link from 'next/link';
import { 
  MapPin,
  Users,
  Bell,
  Settings,
  BarChart3,
  Calendar,
  FileText,
  Shield,
  User,
  Home,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ManagePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
          <div className="text-center text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Đăng nhập để truy cập bảng quản lý"
        icon={<Settings className="w-8 h-8 text-primary-600" />}
      />
    );
  }

  const services = [
    {
      id: 'trips',
      title: 'Quản lý chuyến đi',
      description: 'Tạo, quản lý và theo dõi các chuyến đi của bạn',
      icon: MapPin,
      href: '/trips/manage',
      bgColor: 'bg-success-50',
      iconColor: 'text-success-600',
      stats: 'Tổng chuyến đi',
      features: ['Tạo chuyến đi mới', 'Quản lý chi phí', 'Theo dõi thành viên', 'Quyết toán']
    },
    {
      id: 'groups',
      title: 'Quản lý nhóm',
      description: 'Quản lý các nhóm và cộng đồng của bạn',
      icon: Users,
      href: '/groups/manage',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
      stats: 'Nhóm đã tham gia',
      features: ['Tạo nhóm mới', 'Quản lý thành viên', 'Cài đặt nhóm', 'Mời tham gia']
    },
    {
      id: 'notifications',
      title: 'Quản lý thông báo',
      description: 'Xem và quản lý tất cả thông báo của bạn',
      icon: Bell,
      href: '/notifications',
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning-600',
      stats: 'Thông báo mới',
      features: ['Xem thông báo', 'Đánh dấu đã đọc', 'Cài đặt thông báo', 'Lọc theo loại']
    },
    {
      id: 'profile',
      title: 'Quản lý hồ sơ',
      description: 'Cập nhật thông tin cá nhân và cài đặt tài khoản',
      icon: User,
      href: '/settings',
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-700',
      stats: 'Thông tin cá nhân',
      features: ['Cập nhật hồ sơ', 'Đổi mật khẩu', 'Cài đặt bảo mật', 'Xóa tài khoản']
    },
    {
      id: 'reports',
      title: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo chi tiết và thống kê hoạt động',
      icon: BarChart3,
      href: '/reports',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-700',
      stats: 'Báo cáo tổng quan',
      features: ['Thống kê chi phí', 'Báo cáo chuyến đi', 'Phân tích nhóm', 'Xuất dữ liệu']
    },
    {
      id: 'calendar',
      title: 'Lịch & Sự kiện',
      description: 'Quản lý lịch trình và các sự kiện quan trọng',
      icon: Calendar,
      href: '/calendar',
      bgColor: 'bg-success-100',
      iconColor: 'text-success-700',
      stats: 'Sự kiện sắp tới',
      features: ['Xem lịch', 'Tạo sự kiện', 'Nhắc nhở', 'Đồng bộ lịch']
    }
  ];

  const quickActions = [
    {
      title: 'Tạo chuyến đi mới',
      description: 'Bắt đầu một chuyến đi mới',
      icon: MapPin,
      href: '/trips/manage',
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
    {
      title: 'Tạo nhóm mới',
      description: 'Tạo nhóm để kết nối với bạn bè',
      icon: Users,
      href: '/groups/create',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Xem thông báo',
      description: 'Kiểm tra thông báo mới',
      icon: Bell,
      href: '/notifications',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    },
    {
      title: 'Cài đặt',
      description: 'Quản lý cài đặt tài khoản',
      icon: Settings,
      href: '/settings',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    }
  ];

  return (
    // Design System: Clean bg-gray-50, responsive spacing
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header Section - Design System Typography */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                Bảng Quản Lý
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý tất cả dịch vụ và hoạt động của bạn
              </p>
            </div>
            <div>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions - Design System: Responsive grid */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="h-full cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-3 rounded-lg ${action.bgColor}`}>
                          <IconComponent className={`w-6 h-6 ${action.color}`} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Services - Design System: Responsive grid */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
            Dịch vụ chính
          </h2>
          <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link key={service.id} href={service.href}>
                  <Card className="cursor-pointer group h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-lg ${service.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${service.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base lg:text-lg group-hover:text-primary-600 transition-colors">
                              {service.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-success-600" />
                          <span>{service.stats}</span>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-700">Tính năng:</h4>
                          <div className="flex flex-wrap gap-2">
                            {service.features.map((feature, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 font-medium"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Status - Design System: Semantic colors */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
            Trạng thái hệ thống
          </h2>
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Hệ thống hoạt động</p>
                    <p className="text-xs text-gray-600">Tất cả dịch vụ bình thường</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Thời gian phản hồi</p>
                    <p className="text-xs text-gray-600">Trung bình 200ms</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Bảo mật</p>
                    <p className="text-xs text-gray-600">Mã hóa an toàn</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 Budgo. Quản lý chuyến đi và nhóm một cách thông minh.
          </p>
        </div>
      </div>
    </div>
  );
}
