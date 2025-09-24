'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/lib/auth';
import { testFirestoreConnection, debugUserGroups } from '@/lib/debug';
import { toast } from 'sonner';

export default function TestPage() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  const handleTestFirestore = async () => {
    try {
      setDebugLoading(true);
      const result = await testFirestoreConnection();
      setDebugInfo(result);
      if (result.success) {
        toast.success('Firestore kết nối thành công!');
      } else {
        toast.error('Firestore kết nối thất bại!');
      }
    } catch (error) {
      console.error('Firestore test error:', error);
      toast.error('Có lỗi khi test Firestore');
    } finally {
      setDebugLoading(false);
    }
  };

  const handleDebugUserGroups = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước');
      return;
    }
    
    try {
      setDebugLoading(true);
      const result = await debugUserGroups(user.uid);
      setDebugInfo(result);
      toast.success('Debug hoàn thành! Xem console để biết chi tiết');
    } catch (error) {
      console.error('Debug user groups error:', error);
      toast.error('Có lỗi khi debug user groups');
    } finally {
      setDebugLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test Page - Q&A Tracker
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div>
                    <strong>Đã đăng nhập:</strong> Có
                  </div>
                  <div>
                    <strong>Tên:</strong> {user.displayName || 'N/A'}
                  </div>
                  <div>
                    <strong>Email:</strong> {user.email || 'N/A'}
                  </div>
                  <div>
                    <strong>UID:</strong> {user.uid}
                  </div>
                  <div>
                    <strong>Avatar:</strong> 
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full ml-2 inline-block"
                      />
                    )}
                  </div>
                  <Button onClick={handleLogout} variant="destructive">
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div>
                  <strong>Đã đăng nhập:</strong> Không
                  <div className="mt-4">
                    <a href="/login" className="text-blue-600 hover:underline">
                      Đăng nhập ngay
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Google Sign-in:</span>
                  <span className="text-green-600">✅ Hoàn thành</span>
                </div>
                <div className="flex justify-between">
                  <span>Create Account:</span>
                  <span className="text-green-600">✅ Hoàn thành</span>
                </div>
                <div className="flex justify-between">
                  <span>Create Group:</span>
                  <span className="text-green-600">✅ Hoàn thành</span>
                </div>
                <div className="flex justify-between">
                  <span>Join Group:</span>
                  <span className="text-green-600">✅ Hoàn thành</span>
                </div>
                <div className="flex justify-between">
                  <span>Create Trip:</span>
                  <span className="text-yellow-600">⏳ Đang phát triển</span>
                </div>
                <div className="flex justify-between">
                  <span>Add Expense:</span>
                  <span className="text-yellow-600">⏳ Đang phát triển</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <a href="/" className="text-blue-600 hover:underline block">
                  🏠 Trang chủ
                </a>
              </div>
              <div>
                <a href="/login" className="text-blue-600 hover:underline block">
                  🔐 Đăng nhập
                </a>
              </div>
              <div>
                <a href="/onboarding" className="text-blue-600 hover:underline block">
                  👤 Tạo tài khoản
                </a>
              </div>
              <div>
                <a href="/dashboard" className="text-blue-600 hover:underline block">
                  📊 Dashboard
                </a>
              </div>
              <div>
                <a href="/groups/create" className="text-blue-600 hover:underline block">
                  👥 Tạo nhóm
                </a>
              </div>
              <div>
                <a href="/groups/search" className="text-blue-600 hover:underline block">
                  🔍 Tìm kiếm nhóm
                </a>
              </div>
              <div>
                <a href="/help" className="text-blue-600 hover:underline block">
                  ❓ Trợ giúp
                </a>
              </div>
              <div>
                <a href="/debug" className="text-blue-600 hover:underline block">
                  🐛 Debug Page
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Firebase API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}
                </div>
                <div>
                  <strong>Firebase Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
                </div>
                <div>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleTestFirestore}
                disabled={debugLoading}
                className="w-full"
                variant="outline"
              >
                {debugLoading ? 'Đang test...' : 'Test Firestore Connection'}
              </Button>
              
              {user && (
                <Button 
                  onClick={handleDebugUserGroups}
                  disabled={debugLoading}
                  className="w-full"
                  variant="outline"
                >
                  {debugLoading ? 'Đang debug...' : 'Debug User Groups'}
                </Button>
              )}
              
              {debugInfo && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Debug Result:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
