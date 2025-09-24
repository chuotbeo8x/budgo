'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAdminPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAdminDb = async () => {
    setLoading(true);
    setResult('Testing Admin DB...\n');
    
    try {
      const response = await fetch('/api/test-admin');
      const data = await response.json();
      
      if (data.success) {
        setResult(prev => prev + `✅ Admin DB initialized successfully\n`);
        setResult(prev => prev + `Project ID: ${data.projectId}\n`);
        setResult(prev => prev + `Collections available: ${data.collections.join(', ')}\n`);
      } else {
        setResult(prev => prev + `❌ Error: ${data.error}\n`);
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testSimple = async () => {
    setLoading(true);
    setResult('Testing Simple Connection...\n');
    
    try {
      const response = await fetch('/api/test-simple');
      const data = await response.json();
      
      if (data.success) {
        setResult(prev => prev + `✅ Simple test successful\n`);
        setResult(prev => prev + `Admin DB available: ${data.adminDbAvailable}\n`);
        setResult(prev => prev + `Documents found: ${data.documentsFound}\n`);
        setResult(prev => prev + `Message: ${data.message}\n`);
      } else {
        setResult(prev => prev + `❌ Error: ${data.error}\n`);
        setResult(prev => prev + `Admin DB available: ${data.adminDbAvailable}\n`);
        if (data.stack) {
          setResult(prev => prev + `Stack: ${data.stack}\n`);
        }
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testTripMembers = async () => {
    setLoading(true);
    setResult('Testing Trip Members...\n');
    
    try {
      const response = await fetch('/api/test-trip-members');
      const data = await response.json();
      
      if (data.success) {
        setResult(prev => prev + `✅ Trip Members test successful\n`);
        setResult(prev => prev + `Found ${data.count} members\n`);
        setResult(prev => prev + `Sample data: ${JSON.stringify(data.sample, null, 2)}\n`);
      } else {
        setResult(prev => prev + `❌ Error: ${data.error}\n`);
      }
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Admin Database</h1>
      
      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin DB Test</CardTitle>
            <CardDescription>Test Firebase Admin SDK initialization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testAdminDb} disabled={loading}>
              {loading ? 'Testing...' : 'Test Admin DB'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simple Connection Test</CardTitle>
            <CardDescription>Test basic Admin DB connection</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testSimple} disabled={loading}>
              {loading ? 'Testing...' : 'Test Simple Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Members Test</CardTitle>
            <CardDescription>Test trip members collection access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testTripMembers} disabled={loading}>
              {loading ? 'Testing...' : 'Test Trip Members'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded text-sm">
            {result || 'Click a test button to see results...'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
