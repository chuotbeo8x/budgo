'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DebugUserPage() {
  const [userId, setUserId] = useState('chuotbeo8x');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug-user?userId=${userId}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID or Username</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID or username"
            />
          </div>
          
          <Button onClick={testUser} disabled={loading}>
            {loading ? 'Testing...' : 'Test User'}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


