'use client';

import { useState } from 'react';
import { addExpense } from '@/lib/actions/expenses';

export default function TestTimestampPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAddExpense = async () => {
    setLoading(true);
    try {
      // Create test FormData
      const formData = new FormData();
      formData.append('tripId', 'test_trip_id');
      formData.append('amount', '100000');
      formData.append('description', 'Test expense with timestamp');
      formData.append('paidBy', 'test_member_id');
      formData.append('splitMethod', 'equal');
      formData.append('category', 'food');
      formData.append('createdAt', '2024-01-15'); // Date string from form
      
      console.log('🧪 Testing addExpense with FormData:');
      console.log('createdAt from form:', formData.get('createdAt'));
      
      const result = await addExpense(formData);
      console.log('✅ addExpense result:', result);
      
      setResult({
        success: true,
        message: 'Expense added successfully',
        result
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testTimestampLogic = () => {
    console.log('🧪 Testing timestamp logic:');
    
    // Test the logic from server action
    const createdAtFromForm = '2024-01-15';
    let createdAt;
    
    if (createdAtFromForm) {
      // If form provides a date, use it with current time
      const formDate = new Date(createdAtFromForm);
      if (!isNaN(formDate.getTime())) {
        // Valid date from form, use it with current time
        const now = new Date();
        formDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        createdAt = formDate.toISOString();
        console.log('✅ Created timestamp:', createdAt);
      } else {
        // Invalid date from form, use current timestamp
        createdAt = new Date().toISOString();
        console.log('✅ Fallback timestamp:', createdAt);
      }
    } else {
      // No date from form, use current timestamp
      createdAt = new Date().toISOString();
      console.log('✅ Default timestamp:', createdAt);
    }
    
    setResult({
      success: true,
      message: 'Timestamp logic test completed',
      input: createdAtFromForm,
      output: createdAt,
      parsed: new Date(createdAt).toLocaleString('vi-VN')
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧪 Timestamp Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testTimestampLogic}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Timestamp Logic
          </button>
          
          <button
            onClick={testAddExpense}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Add Expense'}
          </button>
        </div>
        
        {result && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">
              {result.success ? '✅ Success' : '❌ Error'}
            </h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4">
          <h3 className="font-semibold text-yellow-800">🧪 Test Instructions:</h3>
          <ul className="list-disc list-inside text-yellow-700 mt-2">
            <li>Click "Test Timestamp Logic" to test the server action logic</li>
            <li>Click "Test Add Expense" to test the full flow</li>
            <li>Check console logs for detailed information</li>
            <li>Verify that timestamps include time information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
