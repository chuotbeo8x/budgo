'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MapPin, Receipt, ArrowRight, ShieldCheck } from "lucide-react";

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
    <div className="bg-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> 
            Minh bạch • Dễ dùng • Nhanh chóng
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Quản lý nhóm và chuyến đi
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tạo nhóm, lập kế hoạch chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Bắt đầu ngay <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 border-0 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quản lý nhóm</h3>
            <p className="text-gray-600">Tạo nhóm, mời bạn bè và quản lý thành viên dễ dàng</p>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chuyến đi thông minh</h3>
            <p className="text-gray-600">Lập kế hoạch chuyến đi cá nhân hoặc nhóm một cách chi tiết</p>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chia sẻ chi phí</h3>
            <p className="text-gray-600">Ghi nhận chi phí và quyết toán minh bạch, công bằng</p>
          </Card>
        </div>

      </div>
    </div>
  );
}

