'use client';

import { useState } from 'react';
import { migrateTimestamps, checkMigrationStatus } from '@/lib/actions/migrate-timestamps';

export default function MigrateTimestampsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  const handleMigrate = async () => {
    setLoading(true);
    try {
      const result = await migrateTimestamps();
      setResult(result);
    } catch (error) {
      console.error('Migration failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const status = await checkMigrationStatus();
      setStatus(status);
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🔄 Timestamp Migration</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleMigrate}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Migrating...' : 'Run Migration'}
          </button>
          
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
        </div>
        
        {result && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Migration Result</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {status && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">Migration Status</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4">
          <h3 className="font-semibold text-yellow-800">⚠️ Important Notes:</h3>
          <ul className="list-disc list-inside text-yellow-700 mt-2">
            <li>This migration will update old timestamp data to include time information</li>
            <li>Expenses and advances with date-only timestamps will be updated</li>
            <li>New expenses and advances will automatically have full timestamps</li>
            <li>This is a one-time migration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
