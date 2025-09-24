'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getTripMembers, addTripMember } from '@/lib/actions/trips';
import { searchUsersByEmail } from '@/lib/actions/users';
import { getGroupMembers } from '@/lib/actions/groups';
import Link from 'next/link';

export default function DebugTripMembersPage() {
  const { user, loading } = useAuth();
  const [tripId, setTripId] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Test data
  const [testMemberType, setTestMemberType] = useState<'ghost' | 'user' | 'group'>('ghost');
  const [testName, setTestName] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testGroupId, setTestGroupId] = useState('');
  const [testGroupMembers, setTestGroupMembers] = useState<any[]>([]);
  const [testGroupMembersWithDetails, setTestGroupMembersWithDetails] = useState<any[]>([]);
  const [testSearchResults, setTestSearchResults] = useState<any[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  const testLoadMembers = async () => {
    if (!tripId.trim()) {
      toast.error('Vui lòng nhập Trip ID');
      return;
    }

    try {
      setLoadingMembers(true);
      clearLogs();
      
      addLog('=== STARTING TRIP MEMBERS LOAD TEST ===');
      addLog(`Trip ID: ${tripId}`);
      
      // Test getTripMembers
      addLog('Calling getTripMembers...');
      const membersData = await getTripMembers(tripId);
      addLog(`getTripMembers returned: ${membersData.length} members`);
      addLog(`Members data: ${JSON.stringify(membersData, null, 2)}`);
      
      setMembers(membersData);
      
      addLog('=== TEST COMPLETED ===');
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in test:', error);
      toast.error('Có lỗi xảy ra khi test');
    } finally {
      setLoadingMembers(false);
    }
  };

  const testSearchUsers = async () => {
    if (!testEmail.trim()) {
      toast.error('Vui lòng nhập email để tìm kiếm');
      return;
    }

    try {
      clearLogs();
      addLog('=== TESTING USER SEARCH ===');
      addLog(`Search email: ${testEmail}`);
      
      const results = await searchUsersByEmail(testEmail);
      addLog(`Search results: ${results.length} users`);
      addLog(`Results: ${JSON.stringify(results, null, 2)}`);
      
      setTestSearchResults(results);
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in search:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    }
  };

  const testLoadGroupMembers = async () => {
    if (!testGroupId.trim()) {
      toast.error('Vui lòng nhập Group ID');
      return;
    }

    try {
      clearLogs();
      addLog('=== TESTING GROUP MEMBERS LOAD ===');
      addLog(`Group ID: ${testGroupId}`);
      
      const results = await getGroupMembers(testGroupId);
      addLog(`Group members: ${results.length} members`);
      addLog(`Results: ${JSON.stringify(results, null, 2)}`);
      
      setTestGroupMembers(results);
      
      // Load user details
      const userIds = results.map(member => member.userId).filter(Boolean);
      addLog(`Loading user details for: ${userIds.length} users`);
      
      if (userIds.length > 0) {
        const { getUserByIds } = await import('@/lib/actions/users');
        const usersData = await getUserByIds(userIds);
        addLog(`Users data: ${JSON.stringify(usersData, null, 2)}`);
        
        // Create map of user details
        const userMap: { [userId: string]: any } = {};
        usersData.forEach(user => {
          userMap[user.id] = user;
        });
        
        // Combine group members with user details
        const membersWithDetails = results.map(member => ({
          ...member,
          userDetails: userMap[member.userId] || null
        }));
        
        addLog(`Members with details: ${JSON.stringify(membersWithDetails, null, 2)}`);
        setTestGroupMembersWithDetails(membersWithDetails);
      } else {
        setTestGroupMembersWithDetails([]);
      }
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in load group members:', error);
      toast.error('Có lỗi xảy ra khi tải thành viên nhóm');
    }
  };

  const testAddMember = async () => {
    if (!tripId.trim()) {
      toast.error('Vui lòng nhập Trip ID');
      return;
    }

    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      clearLogs();
      addLog('=== TESTING ADD TRIP MEMBER ===');
      addLog(`Trip ID: ${tripId}`);
      addLog(`Member type: ${testMemberType}`);
      
      const formData = new FormData();
      formData.append('userId', user.uid);
      formData.append('tripId', tripId);
      formData.append('type', testMemberType);
      
      if (testMemberType === 'ghost') {
        if (!testName.trim()) {
          toast.error('Vui lòng nhập tên thành viên ảo');
          return;
        }
        formData.append('name', testName);
      } else if (testMemberType === 'user') {
        if (testSearchResults.length === 0) {
          toast.error('Vui lòng tìm kiếm và chọn người dùng trước');
          return;
        }
        formData.append('selectedUser', testSearchResults[0].id);
      } else if (testMemberType === 'group') {
        if (!testGroupId.trim()) {
          toast.error('Vui lòng nhập Group ID');
          return;
        }
        formData.append('groupSelect', testGroupId);
        if (testGroupMembers.length === 0) {
          toast.error('Vui lòng tải thành viên nhóm trước');
          return;
        }
        formData.append('selectedMembers', testGroupMembers[0].id);
      }
      
      addLog(`FormData: ${Array.from(formData.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}`);
      
      const result = await addTripMember(formData);
      addLog(`Add result: ${JSON.stringify(result, null, 2)}`);
      
      toast.success('Thêm thành viên thành công!');
      
      // Reload members
      testLoadMembers();
    } catch (error) {
      addLog(`ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error in add member:', error);
      toast.error('Có lỗi xảy ra khi thêm thành viên');
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
          <h1 className="text-3xl font-bold">Debug Trip Members</h1>
          <p className="text-muted-foreground">Test việc quản lý thành viên chuyến đi</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Về Dashboard</Button>
        </Link>
      </div>

      {/* Test Load Members */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Load Trip Members</CardTitle>
          <CardDescription>
            Nhập Trip ID để test việc load members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tripId">Trip ID</Label>
              <Input
                id="tripId"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                placeholder="Nhập Trip ID"
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

      {/* Test Add Member */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Add Trip Member</CardTitle>
          <CardDescription>
            Test thêm thành viên vào chuyến đi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="memberType">Loại thành viên</Label>
              <select
                id="memberType"
                value={testMemberType}
                onChange={(e) => setTestMemberType(e.target.value as 'ghost' | 'user' | 'group')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ghost">Thành viên ảo</option>
                <option value="user">Người dùng</option>
                <option value="group">Nhóm</option>
              </select>
            </div>

            {testMemberType === 'ghost' && (
              <div>
                <Label htmlFor="testName">Tên thành viên ảo</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Tên hiển thị"
                />
              </div>
            )}

            {testMemberType === 'user' && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="testEmail">Email để tìm kiếm</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="testEmail"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Email người dùng"
                    />
                    <Button onClick={testSearchUsers} variant="outline">
                      Tìm kiếm
                    </Button>
                  </div>
                </div>
                {testSearchResults.length > 0 && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p>Kết quả tìm kiếm:</p>
                    {testSearchResults.map((user, index) => (
                      <div key={index}>
                        {user.name} ({user.email}) - ID: {user.id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {testMemberType === 'group' && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="testGroupId">Group ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="testGroupId"
                      value={testGroupId}
                      onChange={(e) => setTestGroupId(e.target.value)}
                      placeholder="Group ID"
                    />
                    <Button onClick={testLoadGroupMembers} variant="outline">
                      Load Members
                    </Button>
                  </div>
                </div>
                {testGroupMembersWithDetails.length > 0 && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <p>Thành viên nhóm với chi tiết:</p>
                    {testGroupMembersWithDetails.map((member, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded border">
                        <div><strong>Name:</strong> {member.userDetails?.name || `User ${member.userId.slice(0, 8)}`}</div>
                        <div><strong>Email:</strong> {member.userDetails?.email || 'No email'}</div>
                        <div><strong>Role:</strong> {member.role}</div>
                        <div><strong>User ID:</strong> {member.userId}</div>
                        <div><strong>Member ID:</strong> {member.id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button onClick={testAddMember} className="w-full">
              Test Add Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Members ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div><strong>ID:</strong> {member.id}</div>
                    <div><strong>Name:</strong> {member.name}</div>
                    <div><strong>Type:</strong> {member.type}</div>
                    <div><strong>Role:</strong> {member.role}</div>
                    <div><strong>User ID:</strong> {member.userId || 'N/A'}</div>
                    <div><strong>Group ID:</strong> {member.groupId || 'N/A'}</div>
                    <div><strong>Joined:</strong> {member.joinedAt?.toString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}
