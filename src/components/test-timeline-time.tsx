/**
 * Test component to verify timeline time display
 */

import React from 'react';
import { formatCurrency } from '@/lib/utils/currency';

// Test data with different time formats
const testExpenses = [
  {
    id: '1',
    amount: 100000,
    description: 'Test expense 1',
    paidBy: 'user1',
    createdAt: new Date('2024-01-15T14:30:00'),
    type: 'expense' as const
  },
  {
    id: '2', 
    amount: 200000,
    description: 'Test expense 2',
    paidBy: 'user2',
    createdAt: new Date('2024-01-15T09:15:00'),
    type: 'expense' as const
  },
  {
    id: '3',
    amount: 50000,
    description: 'Test expense 3',
    paidBy: 'user1',
    createdAt: '2024-01-15', // Date-only string
    type: 'expense' as const
  }
];

const testAdvances = [
  {
    id: '1',
    amount: 300000,
    description: 'Test advance 1',
    paidBy: 'user1',
    paidTo: 'user2',
    createdAt: new Date('2024-01-15T16:45:00'),
    type: 'advance' as const
  },
  {
    id: '2',
    amount: 150000,
    description: 'Test advance 2', 
    paidBy: 'user2',
    paidTo: 'user1',
    createdAt: '2024-01-15', // Date-only string
    type: 'advance' as const
  }
];

// Test function to parse createdAt
const parseCreatedAt = (createdAt: any): Date => {
  if (createdAt instanceof Date) {
    return createdAt;
  }
  if (createdAt?.toDate) {
    return createdAt.toDate();
  }
  if (typeof createdAt === 'string') {
    return new Date(createdAt);
  }
  return new Date();
};

// Test function to format time
const formatTime = (createdAt: any): string => {
  try {
    const date = parseCreatedAt(createdAt);
    
    // Check if it's a date-only string from database
    if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return '--:--';
    }
    
    // Check if the time is 00:00 (likely old data with date-only input)
    const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;
    
    if (isMidnight) {
      return '--:--';
    }
    
    const timeStr = date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    
    return timeStr;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
};

// Test component
export default function TestTimelineTime() {
  const allItems = [
    ...testExpenses,
    ...testAdvances
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Timeline Time Display Test</h2>
      
      <div className="space-y-2">
        {allItems.map((item) => (
          <div key={item.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{item.description}</div>
                <div className="text-sm text-gray-600">
                  {item.type === 'expense' ? 'Chi phí' : 'Tạm ứng'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">
                  {formatCurrency(item.amount, 'VND')}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <span>🕐</span>
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Debug info */}
            <div className="mt-2 text-xs text-gray-400">
              <div>Raw createdAt: {JSON.stringify(item.createdAt)}</div>
              <div>Parsed date: {parseCreatedAt(item.createdAt).toISOString()}</div>
              <div>Formatted time: {formatTime(item.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Test different time formats */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Time Format Tests:</h3>
        <div className="space-y-1 text-sm">
          <div>Date object: {formatTime(new Date('2024-01-15T14:30:00'))}</div>
          <div>Date string: {formatTime('2024-01-15T14:30:00')}</div>
          <div>Date-only string: {formatTime('2024-01-15')}</div>
          <div>Invalid string: {formatTime('invalid')}</div>
          <div>Null: {formatTime(null)}</div>
          <div>Undefined: {formatTime(undefined)}</div>
        </div>
      </div>
    </div>
  );
}
