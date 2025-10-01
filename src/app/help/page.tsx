'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const commonIssues = [
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Lỗi 'Đăng nhập bị hủy'",
      description: "Bạn đã đóng popup đăng nhập Google trước khi hoàn thành",
      solution: "Vui lòng thử lại và không đóng popup cho đến khi đăng nhập xong"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Lỗi 'Popup bị chặn'",
      description: "Trình duyệt đã chặn popup đăng nhập",
      solution: "Cho phép popup cho trang web này trong cài đặt trình duyệt"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Lỗi 'Domain không được phép'",
      description: "Domain hiện tại chưa được cấu hình trong Firebase",
      solution: "Liên hệ quản trị viên để thêm domain vào danh sách được phép"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Lỗi 'Username đã được sử dụng'",
      description: "Username bạn chọn đã có người khác sử dụng",
      solution: "Thử username khác hoặc thêm số/số gạch ngang"
    },
    {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      title: "Lỗi 'Slug đã được sử dụng'",
      description: "Tên nhóm bạn chọn đã có người khác sử dụng",
      solution: "Thử tên nhóm khác hoặc thêm số/số gạch ngang"
    }
  ];

  const tips = [
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "Username tốt",
      description: "Sử dụng chữ thường, số và dấu gạch ngang. Ví dụ: nguyen-van-a, team-2024"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "Tên nhóm rõ ràng",
      description: "Đặt tên nhóm dễ nhớ và mô tả rõ mục đích. Ví dụ: nhom-du-lich-ha-long"
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      title: "Bảo mật tài khoản",
      description: "Không chia sẻ thông tin đăng nhập và thường xuyên kiểm tra hoạt động"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trung tâm trợ giúp
            </h1>
            <p className="text-gray-600">
              Hướng dẫn và giải đáp các vấn đề thường gặp
            </p>
          </div>

          {/* Common Issues */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Vấn đề thường gặp
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {commonIssues.map((issue, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {issue.icon}
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                    </div>
                    <CardDescription>{issue.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Giải pháp:</strong> {issue.solution}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mẹo sử dụng
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {tips.map((tip, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      {tip.icon}
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Liên kết nhanh
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-blue-500" />
                    <span>Hướng dẫn sử dụng</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/" className="block text-blue-600 hover:underline">
                    🏠 Trang chủ
                  </Link>
                  <Link href="/login" className="block text-blue-600 hover:underline">
                    🔐 Đăng nhập
                  </Link>
                  <Link href="/dashboard" className="block text-blue-600 hover:underline">
                    📊 Dashboard
                  </Link>
                  <Link href="/groups/create" className="block text-blue-600 hover:underline">
                    👥 Tạo nhóm
                  </Link>
                  <Link href="/groups/search" className="block text-blue-600 hover:underline">
                    🔍 Tìm kiếm nhóm
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span>Kiểm tra hệ thống</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/test" className="block text-blue-600 hover:underline">
                    🧪 Trang test
                  </Link>
                  <div className="text-sm text-gray-500">
                    Kiểm tra trạng thái ứng dụng và các tính năng
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Liên hệ hỗ trợ</CardTitle>
              <CardDescription>
                Nếu bạn gặp vấn đề không có trong danh sách trên
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Vui lòng liên hệ với chúng tôi qua:
                </p>
                <div className="space-y-2">
                  <p>📧 Email: support@budgo.com</p>
                  <p>💬 Discord: Q&A Tracker Community</p>
                  <p>📱 Telegram: @qa_tracker_support</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Lưu ý:</strong> Khi liên hệ, vui lòng cung cấp thông tin chi tiết về lỗi gặp phải, 
                    bao gồm thông báo lỗi và các bước đã thực hiện.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


