'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Users</CardTitle>
          <Button onClick={fetchUsers} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={index} className="border p-4 rounded">
                <h3 className="font-semibold">{user.name || 'No name'}</h3>
                <p className="text-sm text-gray-600">ID: {user.id}</p>
                <p className="text-sm text-gray-600">Username: {user.username || 'No username'}</p>
                <p className="text-sm text-gray-600">Email: {user.email || 'No email'}</p>
                <p className="text-sm text-gray-600">Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'No date'}</p>
              </div>
            ))}
            {users.length === 0 && !loading && (
              <p className="text-gray-500">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


