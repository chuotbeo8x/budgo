'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CreateTestUserPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const createTestUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-test-user', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This will create a test user with username &quot;chuotbeo8x&quot; for testing the profile page.
          </p>
          
          <Button onClick={createTestUser} disabled={loading}>
            {loading ? 'Creating...' : 'Create Test User'}
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


