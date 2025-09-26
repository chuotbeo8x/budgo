'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, LogIn } from 'lucide-react';
import { signInWithGoogle } from '@/lib/auth';
import { toast } from 'sonner';

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
  buttonText = "Đăng nhập với Google",
  className = ""
}: LoginPromptProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('LoginPrompt: Starting Google sign in...');
      await signInWithGoogle();
      console.log('LoginPrompt: Google sign in successful!');
      // ProfileProvider will handle the redirect logic
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>{buttonText}</span>
                  </div>
                )}
              </Button>
              
              <p className="text-sm text-gray-500">
                Đăng nhập nhanh và an toàn với Google
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
