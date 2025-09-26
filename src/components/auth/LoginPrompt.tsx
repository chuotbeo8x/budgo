'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, LogIn } from 'lucide-react';
import Link from 'next/link';

interface LoginPromptProps {
  title?: string;
  description?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
  buttonText?: string;
  className?: string;
}

export default function LoginPrompt({
  title = "Vui lòng đăng nhập",
  description = "Bạn cần đăng nhập để truy cập tính năng này",
  showIcon = true,
  icon,
  buttonText = "Đăng nhập",
  className = ""
}: LoginPromptProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            {showIcon && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                {icon || <User className="w-8 h-8 text-blue-600" />}
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {title}
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>
            
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button size="lg" className="w-full">
                  <LogIn className="w-5 h-5 mr-2" />
                  {buttonText}
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500">
                Chưa có tài khoản?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Đăng nhập với Google
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
