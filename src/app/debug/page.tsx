'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getUserGroups } from '@/lib/actions/groups';
import { debugFirestoreData } from '@/lib/debug-firestore';
import { Group } from '@/lib/types';

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testGetUserGroups = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setLoadingGroups(true);
      console.log('=== DEBUG: Testing getUserGroups ===');
      console.log('User ID:', user.uid);
      
      const userGroups = await getUserGroups(user.uid);
      console.log('=== DEBUG: getUserGroups result ===');
      console.log('Groups received:', userGroups);
      
      setGroups(userGroups);
      setDebugInfo({
        userId: user.uid,
        groupsCount: userGroups.length,
        groups: userGroups
      });
      
      toast.success(`Tìm thấy ${userGroups.length} nhóm`);
    } catch (error) {
      console.error('=== DEBUG: Error in getUserGroups ===');
      console.error('Error:', error);
      toast.error('Có lỗi xảy ra khi tải nhóm');
    } finally {
      setLoadingGroups(false);
    }
  };

  const testFirestoreConnection = async () => {
    try {
      console.log('=== DEBUG: Testing Firestore connection ===');
      const result = await debugFirestoreData();
      setDebugInfo(result);
      
      if (result.success) {
        toast.success(`Firestore OK: ${result.groupsCount} groups, ${result.membersCount} members`);
      } else {
        toast.error('Lỗi kết nối Firestore');
      }
    } catch (error) {
      console.error('=== DEBUG: Firestore connection error ===');
      console.error('Error:', error);
      toast.error('Lỗi kết nối Firestore');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để debug
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Debug Page
          </h1>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Test getUserGroups</CardTitle>
                <CardDescription>
                  Kiểm tra function getUserGroups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={testGetUserGroups}
                  disabled={loadingGroups}
                  className="w-full"
                >
                  {loadingGroups ? 'Đang test...' : 'Test getUserGroups'}
                </Button>
                
                <Button 
                  onClick={testFirestoreConnection}
                  disabled={loadingGroups}
                  className="w-full"
                  variant="outline"
                >
                  {loadingGroups ? 'Đang test...' : 'Test Firestore Data'}
                </Button>
                
                {groups.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Kết quả:</h4>
                    <div className="text-sm text-gray-600">
                      <p>Tìm thấy {groups.length} nhóm</p>
                      {groups.map((group, index) => (
                        <div key={group.id} className="mt-2 p-2 bg-gray-100 rounded">
                          <p><strong>Nhóm {index + 1}:</strong></p>
                          <p>ID: {group.id}</p>
                          <p>Tên: {group.name}</p>
                          <p>Slug: {group.slug}</p>
                          <p>Owner: {group.ownerId}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debug Info</CardTitle>
                <CardDescription>
                  Thông tin debug chi tiết
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugInfo && (
                  <div className="text-sm">
                    <pre className="bg-gray-100 p-4 rounded overflow-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Console Logs</CardTitle>
              <CardDescription>
                Mở Developer Tools (F12) để xem console logs chi tiết
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Tất cả debug logs sẽ hiển thị trong Console của browser.
                Hãy mở Developer Tools (F12) và chọn tab Console để xem chi tiết.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
