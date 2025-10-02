'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Expense, Advance, Trip, TripMember } from '@/lib/types';
import ExpenseAdvanceItem from '@/components/ExpenseAdvanceItem';

interface TimelineViewProps {
    expenses: Expense[];
    advances: Advance[];
    members: TripMember[];
    trip: Trip;
    expandedExpenses: Set<string>;
    expandedAdvances: Set<string>;
    toggleExpense: (id: string) => void;
    toggleAdvance: (id: string) => void;
    handleEditExpense: (expense: Expense) => void;
    handleDeleteExpense: (id: string) => void;
    setEditingAdvance: (advance: Advance) => void;
    handleDeleteAdvance: (id: string) => void;
    canEdit: boolean;
    isTripClosed: boolean;
    getCategoryIcon: (category: string) => React.ReactNode;
    getCategoryLabel: (category: string) => string;
    formatTime?: (createdAt: any) => string;
}

export default function TimelineView({
    expenses,
    advances,
    members,
    trip,
    expandedExpenses,
    expandedAdvances,
    toggleExpense,
    toggleAdvance,
    handleEditExpense,
    handleDeleteExpense,
    setEditingAdvance,
    handleDeleteAdvance,
    canEdit,
    isTripClosed,
    getCategoryIcon,
    getCategoryLabel,
    formatTime: externalFormatTime
}: TimelineViewProps) {
    
    // Parse createdAt properly first
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

    // Combine and sort all items by date
    const allItems = [
        ...expenses.map(expense => ({ ...expense, type: 'expense' as const })),
        ...advances.map(advance => ({ ...advance, type: 'advance' as const }))
    ].sort((a, b) => {
        const dateA = parseCreatedAt(a.createdAt);
        const dateB = parseCreatedAt(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });

    // Group by date
    const groupedItems = allItems.reduce((groups, item) => {
        const parsedDate = parseCreatedAt(item.createdAt);
        const dateKey = parsedDate.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(item);
        return groups;
    }, {} as { [key: string]: Array<Expense & { type: 'expense' } | Advance & { type: 'advance' }> });

    const sortedDates = Object.keys(groupedItems).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
    );

    const formatTime = (createdAt: any): string => {
        // Use external formatTime if provided, otherwise use internal logic
        if (externalFormatTime) {
            return externalFormatTime(createdAt);
        }
        
        try {
            const date = parseCreatedAt(createdAt);
            
            // Check if the time is 00:00 (likely old data with date-only input)
            const isMidnight = date.getHours() === 0 && date.getMinutes() === 0;
            
            if (isMidnight) {
                // For date-only data, show a placeholder
                return '--:--';
            }
            
            // Try multiple formatting approaches
            try {
                // Method 1: toLocaleString with timezone
                const formatted = date.toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Ho_Chi_Minh'
                });
                
                return formatted;
            } catch (error) {
                console.error('Error formatting time:', error);
                // Fallback: manual formatting
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        } catch (error) {
            console.error('Error formatting time:', error);
            return '--:--';
        }
    };

    return (
        <div className="space-y-2">
            {/* Compact Timeline */}
            <div className="relative pl-8">
                {/* Timeline line */}
                <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {sortedDates.map((dateKey, dateIndex) => {
                    const dateItems = groupedItems[dateKey];
                    const totalAmount = dateItems.reduce((sum, item) => sum + item.amount, 0);
                    
                    return (
                        <div key={dateKey} className="relative mb-4">
                            {/* Date Header - Compact */}
                            <div className="flex items-center mb-2">
                                <div className="absolute left-[-26px] w-4 h-4 bg-white rounded-full border-2 border-blue-500 shadow-sm flex items-center justify-center">
                                    <Clock className="w-3 h-3 text-blue-500" />
                                </div>
                                <div className="flex items-center justify-between w-full bg-gray-50 px-3 py-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {parseCreatedAt(dateKey).toLocaleDateString('vi-VN', {
                                                day: 'numeric',
                                                month: 'short',
                                                timeZone: 'Asia/Ho_Chi_Minh'
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {dateItems.length} giao dịch
                                        </span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600">
                                        {formatCurrency(totalAmount, trip.currency)}
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Items - Compact */}
                            <div className="space-y-1 ml-1">
                                {dateItems.map((item, itemIndex) => {
                                    const isExpanded = item.type === 'expense' 
                                        ? expandedExpenses.has(item.id)
                                        : expandedAdvances.has(item.id);
                                    
                                    
                                    const isLastItem = itemIndex === dateItems.length - 1;

                                    return (
                                        <div key={`${item.type}-${item.id}`} className="relative">
                                            
                                            {/* Item Node - Compact */}
                                            <div className="flex items-center">
                                                <div className={`absolute -left-7 w-3 h-3 rounded-full border-2 bg-white ${
                                                    item.type === 'expense' 
                                                        ? isExpanded 
                                                            ? '!border-green-500' 
                                                            : '!border-gray-300'
                                                        : '!border-green-500'
                                                }`}></div>
                                                
                                                <div className="flex-1">
                                                    <ExpenseAdvanceItem
                                                        item={item}
                                                        type={item.type}
                                                        members={members}
                                                        trip={trip}
                                                        isExpanded={isExpanded}
                                                        onToggle={() => item.type === 'expense' ? toggleExpense(item.id) : toggleAdvance(item.id)}
                                                        onEdit={() => item.type === 'expense' ? handleEditExpense(item) : setEditingAdvance(item)}
                                                        onDelete={() => item.type === 'expense' ? handleDeleteExpense(item.id) : handleDeleteAdvance(item.id)}
                                                        canEdit={canEdit}
                                                        isTripClosed={isTripClosed}
                                                        getCategoryIcon={getCategoryIcon}
                                                        getCategoryLabel={getCategoryLabel}
                                                        formatTime={formatTime}
                                                        showDescriptionInHeader={false}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
