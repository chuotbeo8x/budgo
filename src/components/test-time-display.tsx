'use client';

import React from 'react';

// Test different time formats
const testCases = [
    {
        name: 'Firestore Timestamp',
        value: { toDate: () => new Date('2024-01-15T14:30:00') }
    },
    {
        name: 'Date Object',
        value: new Date('2024-01-15T14:30:00')
    },
    {
        name: 'ISO String',
        value: '2024-01-15T14:30:00'
    },
    {
        name: 'Date-only String',
        value: '2024-01-15'
    },
    {
        name: 'Invalid String',
        value: 'invalid-date'
    },
    {
        name: 'Null',
        value: null
    },
    {
        name: 'Undefined',
        value: undefined
    }
];

// Test formatTime function
const formatTime = (createdAt: any): string => {
    console.log('🕐 formatTime called with:', createdAt, 'Type:', typeof createdAt);
    
    try {
        // Handle null/undefined
        if (!createdAt) {
            console.log('🕐 No createdAt, returning --:--');
            return '--:--';
        }
        
        // Handle Firestore Timestamp
        if (createdAt.toDate && typeof createdAt.toDate === 'function') {
            const date = createdAt.toDate();
            console.log('🕐 Firestore Timestamp converted:', date.toISOString());
            const timeStr = date.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            console.log('🕐 Formatted time:', timeStr);
            return timeStr;
        }
        
        // Handle Date object
        if (createdAt instanceof Date) {
            console.log('🕐 Date object:', createdAt.toISOString());
            const timeStr = createdAt.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            console.log('🕐 Formatted time:', timeStr);
            return timeStr;
        }
        
        // Handle string
        if (typeof createdAt === 'string') {
            console.log('🕐 String input:', createdAt);
            
            // Check if it's a date-only string
            if (createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
                console.log('🕐 Date-only string detected, returning --:--');
                return '--:--';
            }
            
            const date = new Date(createdAt);
            if (isNaN(date.getTime())) {
                console.log('🕐 Invalid date string, returning --:--');
                return '--:--';
            }
            
            console.log('🕐 Parsed date:', date.toISOString());
            const timeStr = date.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Ho_Chi_Minh'
            });
            console.log('🕐 Formatted time:', timeStr);
            return timeStr;
        }
        
        // Fallback
        console.log('🕐 Fallback to current time');
        const now = new Date();
        const timeStr = now.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh'
        });
        console.log('🕐 Formatted time:', timeStr);
        return timeStr;
        
    } catch (error) {
        console.error('❌ Error formatting time:', error);
        return '--:--';
    }
};

export default function TestTimeDisplay() {
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">🕐 Time Display Test</h2>
            
            <div className="space-y-2">
                {testCases.map((testCase, index) => (
                    <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">{testCase.name}</div>
                                <div className="text-sm text-gray-600">
                                    Input: {JSON.stringify(testCase.value)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-green-600">
                                    {formatTime(testCase.value)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">📊 Summary</h3>
                <div className="text-sm space-y-1">
                    <div>✅ Firestore Timestamp: {formatTime({ toDate: () => new Date('2024-01-15T14:30:00') })}</div>
                    <div>✅ Date Object: {formatTime(new Date('2024-01-15T14:30:00'))}</div>
                    <div>✅ ISO String: {formatTime('2024-01-15T14:30:00')}</div>
                    <div>✅ Date-only: {formatTime('2024-01-15')}</div>
                    <div>✅ Invalid: {formatTime('invalid')}</div>
                    <div>✅ Null: {formatTime(null)}</div>
                </div>
            </div>
        </div>
    );
}
