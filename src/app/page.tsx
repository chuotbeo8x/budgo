'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, MapPin, Receipt, ArrowRight, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-main">
      <div className="container mx-auto px-4 lg:px-6 py-8 lg:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4 text-primary-600" /> 
            Minh bạch • Dễ dùng • Nhanh chóng
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 lg:mb-6 tracking-tight">
            Quản lý nhóm và chuyến đi
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
            Tạo nhóm, lập kế hoạch chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng
          </p>
          <Button 
            onClick={() => setShowLoginModal(true)}
            size="lg" 
            variant="default" 
            className="h-12 px-8 text-base font-semibold"
          >
            Bắt đầu ngay <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 lg:mb-16">
          <Card className="text-center p-6 lg:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <Users className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 lg:mb-4">Quản lý nhóm</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">Tạo nhóm, mời bạn bè và quản lý thành viên dễ dàng</p>
          </Card>

          <Card className="text-center p-6 lg:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 lg:mb-4">Chuyến đi thông minh</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">Lập kế hoạch chuyến đi cá nhân hoặc nhóm một cách chi tiết</p>
          </Card>

          <Card className="text-center p-6 lg:p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4 lg:mb-6">
              <Receipt className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-600" />
            </div>
            <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 lg:mb-4">Chia sẻ chi phí</h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">Ghi nhận chi phí và quyết toán minh bạch, công bằng</p>
          </Card>
        </div>

      </div>
      <Footer />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
}

