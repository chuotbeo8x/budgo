'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  createGroup, 
  getGroupBySlug, 
  joinGroup, 
  leaveGroup, 
  getGroupMembers,
  checkSlugExists 
} from '@/lib/actions/groups';
import { getUserByIds } from '@/lib/actions/users';
import Link from 'next/link';

export default function TestGroupsPage() {
  const { user, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testCreateGroup = async () => {
    if (!user) {
      addResult('❌ User not logged in');
      return;
    }

    try {
      const testSlug = `test-group-${Date.now()}`;
      const formData = new FormData();
      formData.append('name', 'Test Group');
      formData.append('description', 'Test group description');
      formData.append('type', 'public');
      formData.append('slug', testSlug);
      formData.append('userId', user.uid);

      const result = await createGroup(formData);
      addResult(`✅ Created group: ${testSlug}`);
      return testSlug;
    } catch (error) {
      addResult(`❌ Create group failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const testCheckSlug = async () => {
    try {
      const exists = await checkSlugExists('non-existent-slug');
      addResult(`✅ Check slug (non-existent): ${exists ? 'exists' : 'not exists'}`);
      
      const exists2 = await checkSlugExists('test-group');
      addResult(`✅ Check slug (test-group): ${exists2 ? 'exists' : 'not exists'}`);
    } catch (error) {
      addResult(`❌ Check slug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testGetGroupBySlug = async () => {
    try {
      const group = await getGroupBySlug('non-existent-slug');
      addResult(`✅ Get group (non-existent): ${group ? 'found' : 'not found'}`);
      
      const group2 = await getGroupBySlug('test-group');
      addResult(`✅ Get group (test-group): ${group2 ? 'found' : 'not found'}`);
    } catch (error) {
      addResult(`❌ Get group failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testJoinGroup = async (groupId: string) => {
    if (!user) {
      addResult('❌ User not logged in');
      return;
    }

    try {
      const result = await joinGroup(groupId, user.uid);
      addResult(`✅ Joined group: ${groupId}`);
    } catch (error) {
      addResult(`❌ Join group failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testGetGroupMembers = async (groupId: string) => {
    try {
      const members = await getGroupMembers(groupId);
      addResult(`✅ Get group members: ${members.length} members found`);
    } catch (error) {
      addResult(`❌ Get group members failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testGetUserByIds = async () => {
    if (!user) {
      addResult('❌ User not logged in');
      return;
    }

    try {
      const users = await getUserByIds([user.uid]);
      addResult(`✅ Get users by IDs: ${users.length} users found`);
      if (users.length > 0) {
        addResult(`✅ User details: ${users[0].name} (${users[0].email})`);
      }
    } catch (error) {
      addResult(`❌ Get users by IDs failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    if (!user) {
      addResult('❌ User not logged in');
      return;
    }

    setTesting(true);
    clearResults();
    addResult('🚀 Starting group tests...');

    try {
      // Test 1: Check slug
      addResult('📋 Test 1: Check slug exists');
      await testCheckSlug();

      // Test 2: Get group by slug
      addResult('📋 Test 2: Get group by slug');
      await testGetGroupBySlug();

      // Test 3: Create group
      addResult('📋 Test 3: Create group');
      const groupSlug = await testCreateGroup();

      // Test 4: Join group
      if (groupSlug) {
        addResult('📋 Test 4: Join group');
        await testJoinGroup(groupSlug);

        // Test 5: Get group members
        addResult('📋 Test 5: Get group members');
        await testGetGroupMembers(groupSlug);
      }

      // Test 6: Get users by IDs
      addResult('📋 Test 6: Get users by IDs');
      await testGetUserByIds();

      addResult('🎉 All tests completed!');
    } catch (error) {
      addResult(`❌ Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cần đăng nhập</h1>
          <p className="text-muted-foreground mb-4">
            Bạn cần đăng nhập để test chức năng nhóm
          </p>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Test Chức Năng Nhóm</h1>
          <p className="text-muted-foreground">Kiểm tra các chức năng nhóm hoạt động</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Về Dashboard</Button>
          </Link>
          <Button onClick={clearResults} variant="outline">
            Xóa kết quả
          </Button>
        </div>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Điều khiển Test</CardTitle>
          <CardDescription>
            Chạy các test để kiểm tra chức năng nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testCheckSlug} disabled={testing}>
              Test Check Slug
            </Button>
            <Button onClick={testGetGroupBySlug} disabled={testing}>
              Test Get Group
            </Button>
            <Button onClick={testCreateGroup} disabled={testing}>
              Test Create Group
            </Button>
            <Button onClick={testGetUserByIds} disabled={testing}>
              Test Get Users
            </Button>
          </div>
          <div className="mt-4">
            <Button onClick={runAllTests} disabled={testing} className="w-full">
              {testing ? 'Đang test...' : 'Chạy tất cả test'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Kết quả Test</CardTitle>
          <CardDescription>
            {testResults.length} kết quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Chưa có kết quả test nào. Hãy chạy test để xem kết quả.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded">
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






