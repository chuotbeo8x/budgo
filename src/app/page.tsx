'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MapPin, Receipt, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md">
          <div className="px-6 md:px-10 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Minh bạch • Dễ dùng • Nhanh chóng
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-3">Quản lý nhóm, chuyến đi và chi phí chuyên nghiệp</h1>
              <p className="text-sm md:text-base text-white/90 mb-6 md:mb-8">Lập kế hoạch, ghi nhận và quyết toán minh bạch. Tập trung vào trải nghiệm, chúng tôi lo phần còn lại.</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90">
                    Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Quản lý nhóm
              </CardTitle>
              <CardDescription>Tạo nhóm Public, Close, Secret. Mời bạn bè và quản trị dễ dàng.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              - Thành viên thật & ảo • Quyền sở hữu rõ ràng • Mời qua link
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Chuyến đi thông minh
              </CardTitle>
              <CardDescription>Tạo chuyến đi cá nhân/nhóm, theo dõi ngày đi - ngày về, danh mục.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              - Hỗ trợ VND/USD • Chi phí dự kiến • Quản lý thành viên
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" /> Chia sẻ chi phí
              </CardTitle>
              <CardDescription>Ghi nhận chi phí, tạm ứng; chia đều/ trọng số, quyết toán minh bạch.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              - Xuất báo cáo • Tổng hợp nhanh • Thống kê trực quan
            </CardContent>
          </Card>
        </div>

        {/* Value Props */}
        <div className="mt-6">
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Giao diện gọn gàng</div>
                    <div className="text-sm text-gray-600">Tối ưu khoảng cách, shadow thống nhất, trải nghiệm mượt.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Dữ liệu đáng tin cậy</div>
                    <div className="text-sm text-gray-600">Đồng bộ thời gian thực, xử lý ngày giờ và quyền truy cập chuẩn.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Hợp tác hiệu quả</div>
                    <div className="text-sm text-gray-600">Thành viên, danh hiệu, thông báo sinh nhật & hoạt động.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

