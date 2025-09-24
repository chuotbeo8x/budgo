'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getExpenses } from '@/lib/actions/expenses';
import { Button } from '@/components/ui/button';

export default function DebugExpenseCreatedAtPage() {
  const { user } = useAuth();
  const [tripId, setTripId] = useState('1758017509645_zfgd7eay6');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const checkExpenses = async () => {
    if (!tripId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Checking expenses for tripId:', tripId);
      const expensesData = await getExpenses(tripId);
      console.log('📊 Raw expenses from database:', expensesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('❌ Error checking expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Expense CreatedAt</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Trip ID:</label>
          <input
            type="text"
            value={tripId}
            onChange={(e) => setTripId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <Button onClick={checkExpenses} disabled={loading} className="mb-6">
          {loading ? 'Checking...' : 'Check Expenses'}
        </Button>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Expenses Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(expenses, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}


