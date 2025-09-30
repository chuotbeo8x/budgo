'use client';

import { useState } from 'react';
import { checkTimestamps, getRecentExpenses } from '@/lib/actions/check-timestamps';

export default function CheckTimestampsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [tripId, setTripId] = useState('');
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  const handleCheckAll = async () => {
    setLoading(true);
    try {
      const result = await checkTimestamps();
      setResult(result);
    } catch (error) {
      console.error('Check failed:', error);
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTrip = async () => {
    if (!tripId.trim()) {
      alert('Please enter a trip ID');
      return;
    }
    
    setLoading(true);
    try {
      const expenses = await getRecentExpenses(tripId);
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Check trip failed:', error);
      setRecentExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 Check Timestamps</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={handleCheckAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check All Timestamps'}
          </button>
        </div>
        
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">
              Trip ID:
            </label>
            <input
              type="text"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="Enter trip ID"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleCheckTrip}
            disabled={loading || !tripId.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Check Trip
          </button>
        </div>
        
        {result && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">📊 All Timestamps</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {recentExpenses.length > 0 && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">📋 Recent Expenses for Trip: {tripId}</h2>
            <div className="space-y-2">
              {recentExpenses.map((expense, index) => (
                <div key={expense.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-gray-600">
                        Amount: {expense.amount?.toLocaleString('vi-VN')} VND
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {expense.formatted || 'No date'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Debug info */}
                  <div className="mt-2 text-xs text-gray-400 space-y-1">
                    <div>ID: {expense.id}</div>
                    <div>Raw createdAt: {JSON.stringify(expense.createdAt)}</div>
                    <div>Type: {expense.createdAtType}</div>
                    <div>Is Date Only: {expense.isDateOnly ? 'Yes' : 'No'}</div>
                    <div>Is Full Timestamp: {expense.isFullTimestamp ? 'Yes' : 'No'}</div>
                    <div>Parsed: {expense.parsed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-blue-100 border border-blue-400 rounded p-4">
          <h3 className="font-semibold text-blue-800">🔍 What to Look For:</h3>
          <ul className="list-disc list-inside text-blue-700 mt-2">
            <li><strong>Date Only:</strong> createdAt like "2024-01-15" (old data)</li>
            <li><strong>Full Timestamp:</strong> createdAt like "2024-01-15T14:30:00.000Z" (new data)</li>
            <li><strong>Type:</strong> Should be "string" for both cases</li>
            <li><strong>Parsed:</strong> Should show full ISO string</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
