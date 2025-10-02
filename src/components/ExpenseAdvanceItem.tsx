'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit, Trash2, DollarSign, CreditCard, User, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Expense, Advance, Trip, TripMember } from '@/lib/types';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';

interface ExpenseAdvanceItemProps {
    item: Expense | Advance;
    type: 'expense' | 'advance';
    members: TripMember[];
    trip: Trip;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
    isTripClosed: boolean;
    getCategoryIcon: (category: string) => React.ReactNode;
    getCategoryLabel: (category: string) => string;
    formatTime: (createdAt: any) => string;
    showDescriptionInHeader?: boolean; // For timeline view
}

export default function ExpenseAdvanceItem({
    item,
    type,
    members,
    trip,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    canEdit,
    isTripClosed,
    getCategoryIcon,
    getCategoryLabel,
    formatTime,
    showDescriptionInHeader = true
}: ExpenseAdvanceItemProps) {
    
    return (
        <Card className={`!py-0 !shadow-none !rounded-sm cursor-pointer border-l-2 ${
            isExpanded 
                ? 'border-l-green-500' 
                : 'border-l-gray-300'
        } hover:border-l-green-400`}>
            <CardContent className="p-2" onClick={onToggle}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            {showDescriptionInHeader && (
                                <>
                                    {type === 'expense' ? (
                                        getCategoryIcon((item as Expense).category || 'other')
                                    ) : (
                                        <CreditCard className="w-4 h-4 text-green-600" />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {!isExpanded && (
                                <span className="font-medium text-sm truncate">
                                    {type === 'advance' 
                                        ? members.find(m => m.id === item.paidBy)?.name || members.find(m => m.id === item.paidBy)?.ghostName || 'Unknown'
                                        : item.description || 'Không có mô tả'
                                    }
                                </span>
                            )}
                            {isExpanded && (
                                <span className="text-gray-500 text-sm">
                                    {type === 'expense' ? 'Chi phí' : 'Tạm ứng'}
                                </span>
                            )}
                            {!isExpanded && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex-shrink-0">
                                    {type === 'expense' ? getCategoryLabel((item as Expense).category || 'other') : 'Tạm ứng'}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                            <div className={`font-semibold text-sm ${
                                type === 'expense' ? 'text-green-700' : 'text-green-700'
                            }`}>
                                {formatCurrency(item.amount, trip.currency)}
                            </div>
                        </div>
                        
                        {/* Desktop Action buttons */}
                        {canEdit && !isTripClosed && (
                            <div className="hidden md:flex space-x-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    onClick={onEdit}
                                    className="h-6 w-6 p-0 !px-0 !py-0 !min-h-0 !min-w-0"
                                >
                                    <Edit className="w-3 h-3" />
                                </Button>
                                <DeleteConfirmDialog
                                    title={type === 'expense' ? "Xóa chi phí" : "Xóa tạm ứng"}
                                    description={type === 'expense' ? "Bạn có chắc chắn muốn xóa chi phí này?" : "Bạn có chắc chắn muốn xóa tạm ứng này?"}
                                    onConfirm={onDelete}
                                    trigger={
                                        <Button 
                                            variant="ghost"
                                            className="h-6 w-6 p-0 !px-0 !py-0 !min-h-0 !min-w-0 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        {/* Description at top when expanded */}
                        {item.description && (
                            <div className="mb-3 flex items-center justify-between pb-3 border-b border-gray-50">
                                <div className="text-sm font-medium text-gray-900">
                                    {item.description}
                                </div>
                                
                                {/* Mobile action buttons */}
                                {canEdit && !isTripClosed && (
                                    <div className="flex space-x-1 md:hidden" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            onClick={onEdit}
                                            className="h-6 w-6 p-0 !px-0 !py-0 !min-h-0 !min-w-0"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <DeleteConfirmDialog
                                            title={type === 'expense' ? "Xóa chi phí" : "Xóa tạm ứng"}
                                            description={type === 'expense' ? "Bạn có chắc chắn muốn xóa chi phí này?" : "Bạn có chắc chắn muốn xóa tạm ứng này?"}
                                            onConfirm={onDelete}
                                            trigger={
                                                <Button 
                                                    variant="ghost"
                                                    className="h-6 w-6 p-0 !px-0 !py-0 !min-h-0 !min-w-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {/* Basic info row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-3 h-3 text-blue-600" />
                                    <span className="text-gray-600 text-xs">
                                        {type === 'expense' ? 'Chi bởi: ' : 'Ứng bởi: '}
                                        <span className="font-medium">
                                            {members.find(m => m.id === item.paidBy)?.name || members.find(m => m.id === item.paidBy)?.ghostName || 'Unknown'}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-gray-600 text-xs">
                                        {formatTime(item.createdAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Equal split details */}
                            {type === 'expense' && (item as Expense).splitMethod === 'equal' && members.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        <span className="text-gray-600 text-xs font-medium">
                                            Chia đều
                                        </span>
                                    </div>
                                    <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-gray-700 text-xs font-medium">
                                                        {members.length > 1 ? (
                                                            <span 
                                                                className="cursor-help underline decoration-dotted decoration-gray-300 hover:decoration-gray-500 transition-colors"
                                                                title={members.map(m => m.name || m.ghostName).join(', ')}
                                                            >
                                                                {members.length} người
                                                            </span>
                                                        ) : (
                                                            members.find(m => m.id === item.paidBy)?.name || members.find(m => m.id === item.paidBy)?.ghostName || 'Unknown'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center ml-3 flex-shrink-0">
                                                <div className="text-green-600 font-bold text-xs">
                                                    {formatCurrency(item.amount / members.length, trip.currency)}{members.length > 1 ? '/người' : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weight split details - Full width */}
                            {type === 'expense' && (item as Expense).splitMethod === 'weight' && (item as Expense).weightMap && (item as Expense).weightMap!.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                        <span className="text-gray-600 text-xs font-medium">
                                            Chia theo trọng số
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {(() => {
                                            // Group members by weight
                                            const weightGroups = (item as Expense).weightMap!
                                                .filter(w => w.weight > 0) // Only show members with weight > 0
                                                .reduce((groups, weightEntry) => {
                                                    if (!groups[weightEntry.weight]) {
                                                        groups[weightEntry.weight] = [];
                                                    }
                                                    groups[weightEntry.weight].push(weightEntry);
                                                    return groups;
                                                }, {} as { [weight: number]: any[] });

                                            const totalWeight = (item as Expense).weightMap!.reduce((sum, w) => sum + (w.weight > 0 ? w.weight : 0), 0);
                                            
                                            return Object.keys(weightGroups)
                                                .sort((a, b) => parseInt(b) - parseInt(a)) // Sort by weight descending
                                                .map(weight => {
                                                    const membersInGroup = weightGroups[parseInt(weight)];
                                                    const memberNames = membersInGroup
                                                        .map(weightEntry => {
                                                            const member = members.find(m => m.id === weightEntry.memberId);
                                                            return member?.name || member?.ghostName || 'Unknown';
                                                        })
                                                        .join(', ');
                                                    
                                                    // Calculate base amount per person (as if everyone had weight 1)
                                                    const baseAmountPerPerson = totalWeight > 0 ? (item.amount / totalWeight) : 0;
                                                    // Each person with this weight pays: base amount × their weight
                                                    const amountPerPerson = baseAmountPerPerson * parseInt(weight);
                                                    const totalAmountForGroup = amountPerPerson * membersInGroup.length;
                                                    
                                                    return (
                                                        <div key={weight} className="bg-white rounded-lg p-2.5 border border-gray-100">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="text-gray-700 text-xs font-medium">
                                                                            {membersInGroup.length > 1 ? (
                                                                                <span 
                                                                                    className="cursor-help underline decoration-dotted decoration-gray-300 hover:decoration-gray-500 transition-colors"
                                                                                    title={memberNames}
                                                                                >
                                                                                    {membersInGroup.length} người
                                                                                </span>
                                                                            ) : (
                                                                                memberNames
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center ml-3 flex-shrink-0">
                                                                    <div className="text-right">
                                                                        {parseInt(weight) > 1 ? (
                                                                            <div className="text-right">
                                                                                <div className={`font-bold text-xs ${
                                                                                    parseInt(weight) >= 3 ? 'text-red-600' : 
                                                                                    parseInt(weight) === 2 ? 'text-yellow-600' : 
                                                                                    'text-green-600'
                                                                                }`}>
                                                                                    {formatCurrency(amountPerPerson, trip.currency)}{membersInGroup.length > 1 ? '/người' : ''}
                                                                                </div>
                                                                                <div className="text-xs text-gray-500 font-medium">
                                                                                    ({formatCurrency(baseAmountPerPerson, trip.currency)} × {weight} suất)
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-green-600 font-bold text-xs">
                                                                                {formatCurrency(amountPerPerson, trip.currency)}{membersInGroup.length > 1 ? '/người' : ''}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Advance info */}
                            {type === 'advance' && (
                                <div className="text-xs text-gray-600">
                                    Tạm ứng cho chuyến đi
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
