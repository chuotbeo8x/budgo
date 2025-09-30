'use client';

import React, { useEffect, useState } from 'react';
import { getExpenses, getAdvances } from '@/lib/actions/expenses';
import { debugTimelineTimeDisplay } from '@/lib/utils/timeline-debug';

interface DebugTimelineProps {
    tripId: string;
}

export default function DebugTimeline({ tripId }: DebugTimelineProps) {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔍 Fetching expenses and advances for trip:', tripId);
                
                const [expensesData, advancesData] = await Promise.all([
                    getExpenses(tripId),
                    getAdvances(tripId)
                ]);
                
                console.log('📊 Expenses data:', expensesData);
                console.log('📊 Advances data:', advancesData);
                
                setExpenses(expensesData);
                setAdvances(advancesData);
                
                // Debug time display
                const allItems = [...expensesData, ...advancesData];
                debugTimelineTimeDisplay(allItems);
                
            } catch (err) {
                console.error('❌ Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripId]);

    if (loading) {
        return <div className="p-4">Loading debug data...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const allItems = [...expenses, ...advances];

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">🔍 Timeline Debug</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">📊 Data Summary</h3>
                    <div className="space-y-1 text-sm">
                        <div>Expenses: {expenses.length}</div>
                        <div>Advances: {advances.length}</div>
                        <div>Total items: {allItems.length}</div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">🕐 Time Analysis</h3>
                    <div className="space-y-1 text-sm">
                        {allItems.slice(0, 5).map((item, index) => (
                            <div key={item.id || index} className="border rounded p-2">
                                <div className="font-medium">{item.description}</div>
                                <div className="text-gray-600">
                                    Raw: {JSON.stringify(item.createdAt)}
                                </div>
                                <div className="text-gray-600">
                                    Type: {typeof item.createdAt}
                                </div>
                                <div className="text-gray-600">
                                    Is Date: {item.createdAt instanceof Date ? 'Yes' : 'No'}
                                </div>
                                <div className="text-gray-600">
                                    Has toDate: {!!item.createdAt?.toDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">📋 All Items</h3>
                <div className="space-y-2">
                    {allItems.map((item, index) => (
                        <div key={item.id || index} className="border rounded p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{item.description}</div>
                                    <div className="text-sm text-gray-600">
                                        {item.type === 'expense' ? 'Chi phí' : 'Tạm ứng'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-600">
                                        {item.amount?.toLocaleString('vi-VN')} VND
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'No date'}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Debug info */}
                            <div className="mt-2 text-xs text-gray-400 space-y-1">
                                <div>ID: {item.id}</div>
                                <div>Raw createdAt: {JSON.stringify(item.createdAt)}</div>
                                <div>Type: {typeof item.createdAt}</div>
                                <div>Is Date: {item.createdAt instanceof Date ? 'Yes' : 'No'}</div>
                                <div>Has toDate: {!!item.createdAt?.toDate}</div>
                                <div>Parsed: {item.createdAt ? new Date(item.createdAt).toISOString() : 'Invalid'}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
