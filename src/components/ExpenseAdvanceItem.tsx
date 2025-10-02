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
            type === 'expense' 
                ? isExpanded 
                    ? 'border-l-green-500' 
                    : 'border-l-gray-300'
                : 'border-l-green-500'
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-blue-600" />
                                <span className="text-gray-600">
                                    {type === 'expense' ? 'Chi bởi: ' : 'Ứng bởi: '}
                                    <span className="font-medium">
                                        {members.find(m => m.id === item.paidBy)?.name || members.find(m => m.id === item.paidBy)?.ghostName || 'Unknown'}
                                    </span>
                                </span>
                            </div>
                            
                            
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-600">
                                    {formatTime(item.createdAt)}
                                </span>
                            </div>

                            {type === 'expense' && (item as Expense).splitMethod && (
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-3 h-3 text-purple-600" />
                                    <span className="text-gray-600">
                                        {(item as Expense).splitMethod === 'equal' ? 'Chia đều' : 'Theo trọng số'}
                                    </span>
                                </div>
                            )}

                            {type === 'expense' && (item as Expense).splitMethod === 'equal' && members.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                        {members.length} người • {formatCurrency(item.amount / members.length, trip.currency)}/người
                                    </span>
                                </div>
                            )}

                            {type === 'expense' && (item as Expense).splitMethod === 'weight' && (item as Expense).weightMap && (item as Expense).weightMap!.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                        Theo trọng số ({(item as Expense).weightMap!.length} người)
                                    </span>
                                </div>
                            )}

                            {type === 'advance' && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">
                                        Tạm ứng cho chuyến đi
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
