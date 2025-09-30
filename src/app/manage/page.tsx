'use client';

import { useAuth } from '@/components/auth/AuthProvider';
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
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Đăng nhập để truy cập bảng quản lý"
        icon={<Settings className="w-8 h-8 text-blue-600" />}
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
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      stats: 'Tổng chuyến đi',
      features: ['Tạo chuyến đi mới', 'Quản lý chi phí', 'Theo dõi thành viên', 'Quyết toán']
    },
    {
      id: 'groups',
      title: 'Quản lý nhóm',
      description: 'Quản lý các nhóm và cộng đồng của bạn',
      icon: Users,
      href: '/groups/manage',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      stats: 'Nhóm đã tham gia',
      features: ['Tạo nhóm mới', 'Quản lý thành viên', 'Cài đặt nhóm', 'Mời tham gia']
    },
    {
      id: 'notifications',
      title: 'Quản lý thông báo',
      description: 'Xem và quản lý tất cả thông báo của bạn',
      icon: Bell,
      href: '/notifications',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      stats: 'Thông báo mới',
      features: ['Xem thông báo', 'Đánh dấu đã đọc', 'Cài đặt thông báo', 'Lọc theo loại']
    },
    {
      id: 'profile',
      title: 'Quản lý hồ sơ',
      description: 'Cập nhật thông tin cá nhân và cài đặt tài khoản',
      icon: User,
      href: '/settings',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      stats: 'Thông tin cá nhân',
      features: ['Cập nhật hồ sơ', 'Đổi mật khẩu', 'Cài đặt bảo mật', 'Xóa tài khoản']
    },
    {
      id: 'reports',
      title: 'Báo cáo & Thống kê',
      description: 'Xem báo cáo chi tiết và thống kê hoạt động',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      stats: 'Báo cáo tổng quan',
      features: ['Thống kê chi phí', 'Báo cáo chuyến đi', 'Phân tích nhóm', 'Xuất dữ liệu']
    },
    {
      id: 'calendar',
      title: 'Lịch & Sự kiện',
      description: 'Quản lý lịch trình và các sự kiện quan trọng',
      icon: Calendar,
      href: '/calendar',
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      stats: 'Sự kiện sắp tới',
      features: ['Xem lịch', 'Tạo sự kiện', 'Nhắc nhở', 'Đồng bộ lịch']
    }
  ];

  const quickActions = [
    {
      title: 'Tạo chuyến đi mới',
      description: 'Bắt đầu một chuyến đi mới',
      icon: MapPin,
      href: '/trips/manage', // Changed to trips manage page which has modal
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Tạo nhóm mới',
      description: 'Tạo nhóm để kết nối với bạn bè',
      icon: Users,
      href: '/groups/create',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Xem thông báo',
      description: 'Kiểm tra thông báo mới',
      icon: Bell,
      href: '/notifications',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Cài đặt',
      description: 'Quản lý cài đặt tài khoản',
      icon: Settings,
      href: '/settings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Bảng Quản Lý
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                Quản lý tất cả dịch vụ và hoạt động của bạn
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link href="/">
                <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 sm:h-9 text-xs sm:text-sm">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Về trang chủ
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${action.bgColor}`}>
                          <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Services */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Dịch vụ chính
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link key={service.id} href={service.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${service.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${service.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{service.stats}</span>
                        </div>
                        
                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-gray-700">Tính năng:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.features.map((feature, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
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

        {/* System Status */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Trạng thái hệ thống
          </h2>
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hệ thống hoạt động</p>
                    <p className="text-xs text-gray-600">Tất cả dịch vụ đang hoạt động bình thường</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Thời gian phản hồi</p>
                    <p className="text-xs text-gray-600">Trung bình 200ms</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bảo mật</p>
                    <p className="text-xs text-gray-600">Dữ liệu được mã hóa an toàn</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            © 2024 Budgo. Quản lý chuyến đi và nhóm một cách thông minh.
          </p>
        </div>
      </div>
    </div>
  );
}
