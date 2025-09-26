'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/error-alert';
import { signInWithGoogle, handleGoogleRedirect } from '@/lib/auth';
import { getUserById } from '@/lib/actions/users';
import { toast } from 'sonner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle Google redirect result when page loads
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await handleGoogleRedirect();
        if (result) {
          setLoading(true);
          
          // Check if user has profile in our system
          try {
            const userProfile = await getUserById(result.user.uid);
            
            if (userProfile) {
              // User has profile, redirect to dashboard
              router.push('/dashboard');
            } else {
              // User doesn't have profile, redirect to onboarding
              router.push('/onboarding');
            }
          } catch (profileError) {
            console.error('Error checking user profile:', profileError);
            // On error, redirect to onboarding to be safe
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // User will be redirected to Google, so we won't reach here
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message !== 'Redirect initiated') {
        const errorMessage = error.message;
        setError(errorMessage);
        toast.error(errorMessage);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Đăng nhập
          </CardTitle>
          <CardDescription>
            Đăng nhập để quản lý nhóm và chuyến đi của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <ErrorAlert
              message={error}
              onDismiss={() => setError(null)}
            />
          )}
          
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
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
                <span>Tiếp tục với Google</span>
              </div>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Chính sách bảo mật
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}