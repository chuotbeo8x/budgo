'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getGroupMembers } from '@/lib/actions/groups';
import { getUserByIds } from '@/lib/actions/users';
import Link from 'next/link';

export default function DebugMembersPage() {
  const { user, loading } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  const testLoadMembers = async () => {
    if (!groupId.trim()) {
      toast.error('Vui lòng nhập Group ID');
      return;
    }

    try {
      setLoadingMembers(true);
      clearLogs();
      
      addLog('=== STARTING MEMBER LOAD TEST ===');
      addLog(`Group ID: ${groupId}`);
      
      // Test getGroupMembers
      addLog('Calling getGroupMembers...');
      const membersData = await getGroupMembers(groupId);
      addLog(`getGroupMembers returned: ${membersData.length} members`);
      addLog(`Members data: ${JSON.stringify(membersData, null, 2)}`);
      
      setMembers(membersData);
      
      // Test getUserByIds
      const userIds = membersData.map(member => member.userId).filter(Boolean);
      addLog(`User IDs to fetch: ${JSON.stringify(userIds)}`);
      
      if (userIds.length > 0) {
        addLog('Calling getUserByIds...');
        const usersData = await getUserByIds(userIds);
        addLog(`getUserByIds returned: ${usersData.length} users`);
        addLog(`Users data: ${JSON.stringify(usersData, null, 2)}`);
        
        setUsers(usersData);
      } else {
        addLog('No user IDs to fetch');
        setUsers([]);
      }
      
      addLog('=== TEST COMPLETED ===');
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in test:', error);
      toast.error('Có lỗi xảy ra khi test');
    } finally {
      setLoadingMembers(false);
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
          <h1 className="text-3xl font-bold">Debug Members Loading</h1>
          <p className="text-muted-foreground">Test việc load danh sách thành viên</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Về Dashboard</Button>
        </Link>
      </div>

      {/* Test Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Load Members</CardTitle>
          <CardDescription>
            Nhập Group ID để test việc load members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupId">Group ID</Label>
              <Input
                id="groupId"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Nhập Group ID (slug)"
              />
            </div>
            <Button 
              onClick={testLoadMembers} 
              disabled={loadingMembers}
              className="w-full"
            >
              {loadingMembers ? 'Đang test...' : 'Test Load Members'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div><strong>ID:</strong> {member.id}</div>
                    <div><strong>User ID:</strong> {member.userId}</div>
                    <div><strong>Role:</strong> {member.role}</div>
                    <div><strong>Joined:</strong> {member.joinedAt?.toString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Username:</strong> {user.username}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Debug Logs</CardTitle>
              <CardDescription>
                {debugLogs.length} log entries
              </CardDescription>
            </div>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {debugLogs.length === 0 ? (
            <p className="text-muted-foreground">Chưa có log nào</p>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded">
                  {log}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}






