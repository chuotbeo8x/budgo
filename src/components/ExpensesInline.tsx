'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import EditAdvanceModal from '@/components/modals/EditAdvanceModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { addExpense, updateExpense, deleteExpense, addAdvance, deleteAdvance } from '@/lib/actions/expenses';
import { Trip, Expense, TripMember, Advance } from '@/lib/types';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import TimelineView from '@/components/TimelineView';
import ExpenseAdvanceItem from '@/components/ExpenseAdvanceItem';
import {
    Plus,
    User,
    DollarSign,
    Calendar,
    FileText,
    Edit,
    Trash2,
    CreditCard,
    Users,
    Tag,
    Utensils,
    Car,
    Home,
    Gamepad2,
    ShoppingCart,
    Receipt,
    Clock,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface ExpensesInlineProps {
    trip: Trip;
    expenses: Expense[];
    advances: Advance[];
    members: TripMember[];
    showAddButton?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    onExpenseAdded?: (expense: Expense) => void;
    onExpenseUpdated?: (expense: Expense) => void;
    onExpenseDeleted?: (expenseId: string) => void;
    onAdvanceAdded?: (advance: Advance) => void;
    onAdvanceUpdated?: (advance: Advance) => void;
    onAdvanceDeleted?: (advanceId: string) => void;
}

export default function ExpensesInline({
    trip,
    expenses,
    advances,
    members,
    showAddButton = true,
    canEdit = true,
    canDelete = true,
    onExpenseAdded,
    onExpenseUpdated,
    onExpenseDeleted,
    onAdvanceAdded,
    onAdvanceUpdated,
    onAdvanceDeleted
}: ExpensesInlineProps) {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddAdvanceForm, setShowAddAdvanceForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'advances'>('expenses');
    const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());
    const [expandedAdvances, setExpandedAdvances] = useState<Set<string>>(new Set());
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Helper function to parse createdAt properly
  const parseCreatedAt = (createdAt: any): Date => {
    if (!createdAt) return new Date();
    
    // If it's already a Date object
    if (createdAt instanceof Date) return createdAt;
    
    // If it's a Firestore Timestamp
    if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
      return new Date(createdAt.seconds * 1000 + (createdAt.nanoseconds || 0) / 1000000);
    }
    
    // If it's a string, try to parse it
    if (typeof createdAt === 'string') {
      // Check if it's a date-only string (like "2025-09-29")
      if (createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // For date-only strings, use the date as-is (will show as 00:00)
        return new Date(createdAt + 'T00:00:00');
      }
      
      const parsed = new Date(createdAt);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    
    // Fallback to current time
    return new Date();
  };

  // Helper function to format time properly
  const formatTime = (createdAt: any): string => {
    const date = parseCreatedAt(createdAt);
    
    // Always show the actual time, even if it's 00:00
    
    // Try multiple formatting approaches
    try {
      // Method 1: toLocaleString with user's local timezone
      const formatted = date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return formatted;
    } catch (error) {
      console.error('Error formatting time:', error);
      // Fallback: manual formatting
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  };
    const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);
    
    // Local state for immediate UI updates
    const [localExpenses, setLocalExpenses] = useState<Expense[]>(expenses);
    const [localAdvances, setLocalAdvances] = useState<Advance[]>(advances);
    
    // Sync local state with props
    useEffect(() => {
        setLocalExpenses(expenses);
    }, [expenses]);
    
    useEffect(() => {
        setLocalAdvances(advances);
    }, [advances]);
    
    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paidBy: '',
        splitMethod: 'weight' as 'equal' | 'weight',
        category: '',
        weights: {} as { [memberId: string]: number },
        createdAt: '',
        isEqualSplit: false,
    });

    // Advance form state
    const [advanceFormData, setAdvanceFormData] = useState({
        amount: '',
        description: '',
        paidBy: '',
        createdAt: '',
    });

    const isTripClosed = trip?.status === 'closed';

    // Set default date after mount to avoid hydration mismatch
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, createdAt: today }));
        setAdvanceFormData(prev => ({ ...prev, createdAt: today }));
    }, []);

    // Helper functions for expand/collapse
    const toggleExpenseExpanded = (expenseId: string) => {
        setExpandedExpenses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(expenseId)) {
                newSet.delete(expenseId);
            } else {
                newSet.add(expenseId);
            }
            return newSet;
        });
    };

    const toggleAdvanceExpanded = (advanceId: string) => {
        setExpandedAdvances(prev => {
            const newSet = new Set(prev);
            if (newSet.has(advanceId)) {
                newSet.delete(advanceId);
            } else {
                newSet.add(advanceId);
            }
            return newSet;
        });
    };

    // Aliases for TimelineView
    const toggleExpense = toggleExpenseExpanded;
    const toggleAdvance = toggleAdvanceExpanded;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip || !user) return;

        // Parse amount - remove dots and convert to number
        const cleanAmount = formData.amount.replace(/\./g, '');
        const amount = parseFloat(cleanAmount);

        // Validate form
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (!formData.paidBy) {
            toast.error('Vui lòng chọn người chi');
            return;
        }

        if (members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí');
            return;
        }

        try {
            setSubmitting(true);
            const formDataObj = new FormData();
            formDataObj.append('tripId', trip.id);
            formDataObj.append('userId', user.uid);
            formDataObj.append('amount', amount.toString());
            formDataObj.append('description', formData.description);
            formDataObj.append('paidBy', formData.paidBy);
            formDataObj.append('splitMethod', formData.isEqualSplit ? 'equal' : 'weight');
            formDataObj.append('category', formData.category);
            formDataObj.append('createdAt', formData.createdAt);

            // Add weights for weighted split
            if (!formData.isEqualSplit) {
                // If no weights provided, create default weights for all members
                if (Object.keys(formData.weights).length === 0) {
                    members.forEach(member => {
                        formDataObj.append('weightMap', JSON.stringify({
                            memberId: member.id,
                            weight: 1
                        }));
                    });
                } else {
                    // Use provided weights - include all members including those with weight 0
                    Object.entries(formData.weights).forEach(([memberId, weight]) => {
                        formDataObj.append('weightMap', JSON.stringify({
                            memberId,
                            weight: weight || 0
                        }));
                    });
                }
            }

            // Optimistically add to local state FIRST (create temporary expense object)
            const tempExpense: Expense = {
                id: `temp-${Date.now()}`,
                tripId: trip.id,
                amount: amount,
                description: formData.description,
                paidBy: formData.paidBy,
                category: formData.category,
                splitMethod: formData.isEqualSplit ? 'equal' : 'weight',
                weightMap: formData.isEqualSplit ? [] : Object.entries(formData.weights).map(([memberId, weight]) => ({
                    memberId,
                    weight: weight || 0
                })),
                createdAt: new Date(),
                createdBy: user.uid
            };
            setLocalExpenses(prev => [tempExpense, ...prev]);
            
            // Show success immediately
            toast.success('Thêm chi phí thành công!');
            
            // Call server action in background (don't await to prevent blocking)
            addExpense(formDataObj).catch((error) => {
                toast.error('Có lỗi xảy ra khi thêm chi phí');
                // Revert optimistic update on error
                setLocalExpenses(prev => prev.filter(expense => expense.id !== tempExpense.id));
            });
            
            setShowAddForm(false);
            setFormData({
                amount: '',
                description: '',
                paidBy: '',
                splitMethod: 'weight',
                isEqualSplit: false,
                category: '',
                weights: {},
                createdAt: new Date().toISOString().split('T')[0],
            });
            
            // Note: Removed onExpenseAdded callback to prevent reload
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm chi phí');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAdvance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip || !user) return;

        // Parse amount - remove dots and convert to number
        const cleanAmount = advanceFormData.amount.replace(/\./g, '');
        const amount = parseFloat(cleanAmount);

        // Validate form
        if (!advanceFormData.amount || isNaN(amount) || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (!advanceFormData.paidBy) {
            toast.error('Vui lòng chọn người ứng');
            return;
        }

        try {
            setSubmitting(true);
            const formDataObj = new FormData();
            formDataObj.append('tripId', trip.id);
            formDataObj.append('userId', user.uid);
            formDataObj.append('amount', amount.toString());
            formDataObj.append('description', advanceFormData.description);
            formDataObj.append('paidBy', advanceFormData.paidBy);
            formDataObj.append('paidTo', trip.ownerId); // Tạm ứng luôn cho chủ chuyến đi
            formDataObj.append('createdAt', advanceFormData.createdAt);

            // Optimistically add to local state FIRST (create temporary advance object)
            const tempAdvance: Advance = {
                id: `temp-${Date.now()}`,
                tripId: trip.id,
                amount: amount,
                description: advanceFormData.description,
                paidBy: advanceFormData.paidBy,
                paidTo: trip.ownerId,
                createdAt: new Date(advanceFormData.createdAt + 'T00:00:00'),
                createdBy: user.uid
            };
            setLocalAdvances(prev => [tempAdvance, ...prev]);
            
            // Show success immediately
            toast.success('Thêm tạm ứng thành công!');
            
            // Call server action in background (don't await to prevent blocking)
            addAdvance(formDataObj).catch((error) => {
                toast.error('Có lỗi xảy ra khi thêm tạm ứng');
                // Revert optimistic update on error
                setLocalAdvances(prev => prev.filter(advance => advance.id !== tempAdvance.id));
            });
            
            setShowAddAdvanceForm(false);
            setAdvanceFormData({
                amount: '',
                description: '',
                paidBy: '',
                createdAt: new Date().toISOString().split('T')[0],
            });
            
            // Note: Removed onAdvanceAdded callback to prevent reload
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm tạm ứng');
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        const categoryIcons: { [key: string]: any } = {
            'food': Utensils,
            'transport': Car,
            'accommodation': Home,
            'entertainment': Gamepad2,
            'shopping': ShoppingCart,
            'other': Tag,
        };
        const IconComponent = categoryIcons[category] || Tag;
        return <IconComponent className="w-4 h-4" />;
    };

    const getCategoryLabel = (category: string) => {
        const categoryLabels: { [key: string]: string } = {
            'food': 'Ăn uống',
            'transport': 'Di chuyển',
            'accommodation': 'Lưu trú',
            'entertainment': 'Giải trí',
            'shopping': 'Mua sắm',
            'other': 'Khác',
        };
        return categoryLabels[category] || 'Khác';
    };

    const handleDeleteExpense = async (expenseId: string) => {
        if (!user || !trip?.id) return;
        try {
            setSubmitting(true);
            
            // Optimistically update UI
            setLocalExpenses(prev => prev.filter(expense => expense.id !== expenseId));
            
            // Show success immediately
            toast.success('Xóa chi phí thành công');
            
            // Call server action in background
            deleteExpense(expenseId, user.uid).catch((error) => {
                toast.error('Có lỗi xảy ra khi xóa chi phí');
                // Revert optimistic update on error - would need to restore the expense
                // For now, just show error message
            });
            
            // Note: Removed onExpenseDeleted callback to prevent reload
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa chi phí');
            
            // Revert optimistic update on error
            setLocalExpenses(expenses);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAdvance = async (advanceId: string) => {
        if (!user || !trip?.id) return;
        try {
            setSubmitting(true);
            
            // Optimistically update UI
            setLocalAdvances(prev => prev.filter(advance => advance.id !== advanceId));
            
            // Show success immediately
            toast.success('Xóa tạm ứng thành công');
            
            // Call server action in background
            deleteAdvance(advanceId, user.uid).catch((error) => {
                toast.error('Có lỗi xảy ra khi xóa tạm ứng');
                // Revert optimistic update on error - would need to restore the advance
                // For now, just show error message
            });
            
            // Note: Removed onAdvanceDeleted callback to prevent reload
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa tạm ứng');
            
            // Revert optimistic update on error
            setLocalAdvances(advances);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount.toString(),
            description: expense.description || '',
            paidBy: expense.paidBy,
            splitMethod: expense.splitMethod || 'equal',
            category: expense.category || 'other',
            weights: expense.weightMap ? expense.weightMap.reduce((acc, entry) => {
                acc[entry.memberId] = entry.weight;
                return acc;
            }, {} as { [memberId: string]: number }) : {},
            createdAt: (() => {
                if (!expense.createdAt) {
                    return new Date().toISOString().split('T')[0];
                }
                if (expense.createdAt instanceof Date) {
                    return expense.createdAt.toISOString().split('T')[0];
                }
                if (typeof expense.createdAt === 'string') {
                    return expense.createdAt.split('T')[0];
                }
                // Handle Firestore Timestamp
                if (expense.createdAt && typeof expense.createdAt === 'object' && expense.createdAt.seconds) {
                    return new Date(expense.createdAt.seconds * 1000).toISOString().split('T')[0];
                }
                return new Date().toISOString().split('T')[0];
            })(),
            isEqualSplit: expense.splitMethod === 'equal'
        });
    };

    const handleEditAdvance = (advance: Advance) => {
        setEditingAdvance(advance);
    };

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense || !trip || !user) return;

        // Parse amount - remove dots and convert to number
        const cleanAmount = formData.amount.replace(/\./g, '');
        const amount = parseFloat(cleanAmount);

        // Validate form
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Vui lòng nhập mô tả');
            return;
        }

        if (!formData.paidBy) {
            toast.error('Vui lòng chọn người chi');
            return;
        }

        if (members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí');
            return;
        }

        try {
            setSubmitting(true);
            const formDataObj = new FormData();
            formDataObj.append('tripId', trip.id);
            formDataObj.append('userId', user.uid);
            formDataObj.append('amount', amount.toString());
            formDataObj.append('description', formData.description);
            formDataObj.append('paidBy', formData.paidBy);
            formDataObj.append('splitMethod', formData.isEqualSplit ? 'equal' : 'weight');
            formDataObj.append('category', formData.category);
            formDataObj.append('createdAt', formData.createdAt);

            // Add weights for weighted split
            if (!formData.isEqualSplit) {
                // If no weights provided, create default weights for all members
                if (Object.keys(formData.weights).length === 0) {
                    members.forEach(member => {
                        formDataObj.append('weightMap', JSON.stringify({
                            memberId: member.id,
                            weight: 1
                        }));
                    });
                } else {
                    // Use provided weights - include all members including those with weight 0
                    Object.entries(formData.weights).forEach(([memberId, weight]) => {
                        formDataObj.append('weightMap', JSON.stringify({
                            memberId,
                            weight: weight || 0
                        }));
                    });
                }
            }

            // Optimistically update local state FIRST
            const originalExpense = localExpenses.find(e => e.id === editingExpense.id);
            setLocalExpenses(prev => prev.map(expense => 
                expense.id === editingExpense.id 
                    ? {
                        ...expense,
                        amount: amount,
                        description: formData.description,
                        paidBy: formData.paidBy,
                        category: formData.category,
                        splitMethod: formData.isEqualSplit ? 'equal' : 'weight',
                        weightMap: formData.isEqualSplit ? [] : Object.entries(formData.weights).map(([memberId, weight]) => ({
                            memberId,
                            weight: weight || 0
                        })),
                        createdAt: new Date()
                    }
                    : expense
            ));
            
            // Show success immediately
            toast.success('Cập nhật chi phí thành công!');
            
            // Call server action in background (don't await to prevent blocking)
            updateExpense(editingExpense.id, formDataObj).then((result) => {
                // Success handled by optimistic update
            }).catch((error) => {
                toast.error('Có lỗi xảy ra khi cập nhật chi phí');
                // Revert optimistic update on error
                if (originalExpense) {
                    setLocalExpenses(prev => prev.map(expense => 
                        expense.id === editingExpense.id ? originalExpense : expense
                    ));
                }
            });
            
            setEditingExpense(null);
            setFormData({
                amount: '',
                description: '',
                paidBy: '',
                splitMethod: 'weight' as 'equal' | 'weight',
                category: '',
                weights: {} as { [memberId: string]: number },
                createdAt: '',
                isEqualSplit: false,
            });
            
            // Call onExpenseUpdated callback to trigger parent refresh
            if (onExpenseUpdated) {
                onExpenseUpdated();
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật chi phí');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Tabs and Add Buttons */}
            <div className="flex items-center gap-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg flex-1">
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'expenses'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Chi phí ({localExpenses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('advances')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'advances'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <CreditCard className="w-4 h-4 inline mr-2" />
                        Tạm ứng ({localAdvances.length})
                    </button>
                </div>

                {/* Add Buttons - Desktop Only */}
                {showAddButton && !isTripClosed && members.length > 0 && (
                    <div className="hidden md:flex gap-2">
                        {activeTab === 'expenses' && (
                            <Button 
                                onClick={() => setShowAddForm(true)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm chi phí
                            </Button>
                        )}

                        {activeTab === 'advances' && (
                        <Dialog open={showAddAdvanceForm} onOpenChange={setShowAddAdvanceForm}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm tạm ứng
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[95vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle>Thêm tạm ứng mới</DialogTitle>
                                    <DialogDescription>
                                        Thêm tạm ứng cho chuyến đi. Tạm ứng sẽ được ghi nhận cho chủ chuyến đi.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleSubmitAdvance} className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advanceAmount">Số tiền *</Label>
                                            <Input
                                                id="advanceAmount"
                                                type="text"
                                                value={advanceFormData.amount}
                                                onChange={(e) => {
                                                    // Remove all non-numeric characters
                                                    let value = e.target.value.replace(/[^\d]/g, '');

                                                    // Add thousand separators for display
                                                    if (value) {
                                                        const number = parseInt(value);
                                                        value = number.toLocaleString('vi-VN');
                                                    }

                                                    setAdvanceFormData(prev => ({
                                                        ...prev,
                                                        amount: value
                                                    }));
                                                }}
                                                placeholder="Nhập số tiền..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advanceDescription">Mô tả *</Label>
                                            <Input
                                                id="advanceDescription"
                                                type="text"
                                                value={advanceFormData.description}
                                                onChange={(e) => setAdvanceFormData(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                                placeholder="Nhập mô tả tạm ứng..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advancePaidBy">Người ứng *</Label>
                                            <select
                                                id="advancePaidBy"
                                                value={advanceFormData.paidBy}
                                                onChange={(e) => setAdvanceFormData(prev => ({
                                                    ...prev,
                                                    paidBy: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                                required
                                            >
                                                <option value="">Chọn người ứng</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name || member.ghostName || 'Unknown'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAddAdvanceForm(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {submitting ? 'Đang thêm...' : 'Thêm tạm ứng'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        )}
                    </div>
                )}
            </div>


            {/* Add Expense Modal - Shared for Desktop and Mobile */}
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Thêm chi phí mới</DialogTitle>
                        <DialogDescription>
                            Thêm chi phí cho chuyến đi với đầy đủ thông tin và cách chia tiền
                        </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1 sm:space-y-2">
                                <Label htmlFor="amount">Số tiền *</Label>
                                <Input
                                    id="amount"
                                    type="text"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        // Remove all non-numeric characters
                                        let value = e.target.value.replace(/[^\d]/g, '');
                                        
                                        // Add thousand separators for display
                                        if (value.length > 0) {
                                            value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                                        }
                                        
                                        setFormData({ ...formData, amount: value });
                                    }}
                                    placeholder="Nhập số tiền (VD: 500.000 hoặc 500000)..."
                                    required
                                />
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <Label htmlFor="paidBy">Người chi *</Label>
                                <select
                                    id="paidBy"
                                    value={formData.paidBy}
                                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    required
                                >
                                    <option value="">Chọn người chi</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name || member.ghostName || 'Unknown'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <Label htmlFor="createdAt">Ngày tạo *</Label>
                                <Input
                                    id="createdAt"
                                    name="createdAt"
                                    type="date"
                                    value={formData.createdAt}
                                    onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-1 sm:space-y-2">
                                <Label htmlFor="category">Danh mục</Label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                >
                                    <option value="">Chọn danh mục</option>
                                    <option value="food">Ăn uống</option>
                                    <option value="transport">Di chuyển</option>
                                    <option value="accommodation">Lưu trú</option>
                                    <option value="entertainment">Giải trí</option>
                                    <option value="shopping">Mua sắm</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Input
                                id="description"
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Mô tả chi phí..."
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Trọng số cho từng thành viên</Label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isEqualSplit"
                                        checked={formData.isEqualSplit}
                                        onChange={(e) => {
                                            const isEqual = e.target.checked;
                                            const newWeights = { ...formData.weights };
                                            
                                            if (isEqual) {
                                                // Set all members to weight 1 for equal split
                                                members.forEach(member => {
                                                    newWeights[member.id] = 1;
                                                });
                                            }
                                            
                                            setFormData({
                                                ...formData,
                                                isEqualSplit: isEqual,
                                                weights: newWeights
                                            });
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <Label htmlFor="isEqualSplit" className="text-sm font-medium text-blue-600">
                                        Chia đều
                                    </Label>
                                </div>
                            </div>
                            
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between py-1">
                                        <span className="text-sm font-medium truncate flex-1 mr-2">{member.name || member.ghostName}</span>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="1"
                                                value={formData.weights[member.id] ?? 0}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    weights: {
                                                        ...formData.weights,
                                                        [member.id]: parseInt(e.target.value) || 0
                                                    }
                                                })}
                                                className="w-16 h-8 text-sm"
                                                disabled={formData.isEqualSplit}
                                            />
                                            {!formData.isEqualSplit && (
                                                <span className="text-xs text-gray-500">(0 = loại trừ)</span>
                                            )}
                                            {formData.isEqualSplit && (
                                                <span className="text-xs text-blue-500">(tự động)</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <p className="text-xs text-gray-500">
                                {formData.isEqualSplit 
                                    ? '💡 Chia đều: Tất cả thành viên đều trả số tiền bằng nhau'
                                    : '💡 Theo trọng số: Đặt trọng số = 0 để loại trừ thành viên khỏi chi phí này'
                                }
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1">
                                {submitting ? 'Đang thêm...' : 'Thêm chi phí'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setFormData({
                                        amount: '',
                                        description: '',
                                        paidBy: '',
                                        splitMethod: 'weight',
                                        isEqualSplit: false,
                                        category: '',
                                        weights: {},
                                        createdAt: new Date().toISOString().split('T')[0],
                                    });
                                }}
                                disabled={submitting}
                                className="flex-1"
                            >
                                Hủy
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
                <div className="space-y-3 sm:space-y-4">
                    {/* Add Expense Button - Mobile Only */}
                    {showAddButton && !isTripClosed && members.length > 0 && (
                        <div className="md:hidden">
                            <Button 
                                onClick={() => setShowAddForm(true)}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm chi phí mới
                            </Button>
                        </div>
                    )}

                    {/* Edit Expense Modal */}
                    {editingExpense && (
                        <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
                            <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle>Chỉnh sửa chi phí</DialogTitle>
                                    <DialogDescription>
                                        Cập nhật thông tin chi phí
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleUpdateExpense} className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="editAmount">Số tiền *</Label>
                                            <Input
                                                id="editAmount"
                                                type="text"
                                                value={formData.amount}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                                    setFormData({ ...formData, amount: formatted });
                                                }}
                                                placeholder="Nhập số tiền..."
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="editPaidBy">Người chi *</Label>
                                            <select
                                                id="editPaidBy"
                                                value={formData.paidBy}
                                                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                                required
                                            >
                                                <option value="">Chọn người chi</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name || member.ghostName || 'Unknown'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="editCreatedAt">Ngày tạo *</Label>
                                            <Input
                                                id="editCreatedAt"
                                                type="date"
                                                value={formData.createdAt}
                                                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="editCategory">Danh mục *</Label>
                                            <select
                                                id="editCategory"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                                required
                                            >
                                                <option value="food">🍽️ Ăn uống</option>
                                                <option value="transport">🚗 Vận chuyển</option>
                                                <option value="accommodation">🏠 Lưu trú</option>
                                                <option value="entertainment">🎮 Giải trí</option>
                                                <option value="shopping">🛍️ Mua sắm</option>
                                                <option value="other">🏷️ Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Label htmlFor="editDescription">Mô tả *</Label>
                                        <Input
                                            id="editDescription"
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Mô tả chi phí..."
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Cách chia tiền *</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="editEqual"
                                                    name="editSplitMethod"
                                                    value="equal"
                                                    checked={formData.isEqualSplit}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        splitMethod: 'equal',
                                                        isEqualSplit: true
                                                    })}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <Label htmlFor="editEqual" className="text-sm font-medium text-green-600">
                                                    Chia đều
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="editWeight"
                                                    name="editSplitMethod"
                                                    value="weight"
                                                    checked={!formData.isEqualSplit}
                                                    onChange={(e) => setFormData({ 
                                                        ...formData, 
                                                        splitMethod: 'weight',
                                                        isEqualSplit: false
                                                    })}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <Label htmlFor="editWeight" className="text-sm font-medium text-purple-600">
                                                    Theo trọng số
                                                </Label>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between py-1">
                                                    <span className="text-sm font-medium truncate flex-1 mr-2">{member.name || member.ghostName}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="1"
                                                            value={formData.weights[member.id] ?? 0}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                weights: {
                                                                    ...formData.weights,
                                                                    [member.id]: parseInt(e.target.value) || 0
                                                                }
                                                            })}
                                                            className="w-16 h-8 text-sm"
                                                            disabled={formData.isEqualSplit}
                                                        />
                                                        {!formData.isEqualSplit && (
                                                            <span className="text-xs text-gray-500">(0 = loại trừ)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={submitting} className="flex-1">
                                            {submitting ? 'Đang cập nhật...' : 'Cập nhật chi phí'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingExpense(null);
                                                setFormData({
                                                    amount: '',
                                                    description: '',
                                                    paidBy: '',
                                                    splitMethod: 'equal',
                                                    category: 'other',
                                                    weights: {},
                                                    createdAt: new Date().toISOString().split('T')[0],
                                                    isEqualSplit: false
                                                });
                                            }}
                                            disabled={submitting}
                                            className="flex-1"
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    
                    {/* Show message when no members */}
                    {showAddButton && !isTripClosed && members.length === 0 && (
                        <div className="text-center py-4 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800">
                                Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí
                            </p>
                        </div>
                    )}

                    {/* Expenses Timeline */}
                    <TimelineView
                        expenses={localExpenses}
                        advances={[]}
                        members={members}
                        trip={trip}
                        expandedExpenses={expandedExpenses}
                        expandedAdvances={new Set()}
                        toggleExpense={toggleExpense}
                        toggleAdvance={() => {}}
                        handleEditExpense={handleEditExpense}
                        handleDeleteExpense={handleDeleteExpense}
                        setEditingAdvance={() => {}}
                        handleDeleteAdvance={() => {}}
                        canEdit={canEdit}
                        isTripClosed={isTripClosed}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryLabel={getCategoryLabel}
                        formatTime={formatTime}
                    />
                </div>
            )}

            {/* Advances Tab */}
            {activeTab === 'advances' && (
                <div className="space-y-3 sm:space-y-4">
                    {/* Add Advance Button - Mobile Only */}
                    {showAddButton && !isTripClosed && members.length > 0 && (
                        <div className="md:hidden">
                            <Dialog open={showAddAdvanceForm} onOpenChange={setShowAddAdvanceForm}>
                                <DialogTrigger asChild>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm tạm ứng mới
                                    </Button>
                                </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[95vh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle>Thêm tạm ứng mới</DialogTitle>
                                    <DialogDescription>
                                        Thêm tạm ứng cho chuyến đi. Tạm ứng sẽ được ghi nhận cho chủ chuyến đi.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <form onSubmit={handleSubmitAdvance} className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advanceAmount">Số tiền *</Label>
                                            <Input
                                                id="advanceAmount"
                                                type="text"
                                                value={advanceFormData.amount}
                                                onChange={(e) => {
                                                    // Remove all non-numeric characters
                                                    let value = e.target.value.replace(/[^\d]/g, '');

                                                    // Add thousand separators for display
                                                    if (value.length > 0) {
                                                        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
                                                    }

                                                    setAdvanceFormData({ ...advanceFormData, amount: value });
                                                }}
                                                placeholder="Nhập số tiền (VD: 500.000 hoặc 500000)..."
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advancePaidBy">Người ứng *</Label>
                                            <select
                                                id="advancePaidBy"
                                                value={advanceFormData.paidBy}
                                                onChange={(e) => setAdvanceFormData({ ...advanceFormData, paidBy: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                                required
                                            >
                                                <option value="">Chọn người ứng</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name || member.ghostName || 'Unknown'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1 sm:space-y-2">
                                            <Label htmlFor="advanceCreatedAt">Ngày tạo *</Label>
                                            <Input
                                                id="advanceCreatedAt"
                                                type="date"
                                                value={advanceFormData.createdAt}
                                                onChange={(e) => setAdvanceFormData({ ...advanceFormData, createdAt: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <Label htmlFor="advanceDescription">Mô tả</Label>
                                        <Input
                                            id="advanceDescription"
                                            type="text"
                                            value={advanceFormData.description}
                                            onChange={(e) => setAdvanceFormData({ ...advanceFormData, description: e.target.value })}
                                            placeholder="Mô tả tạm ứng..."
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={submitting} className="flex-1">
                                            {submitting ? 'Đang thêm...' : 'Thêm tạm ứng'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddAdvanceForm(false);
                                                setAdvanceFormData({
                                                    amount: '',
                                                    description: '',
                                                    paidBy: '',
                                                    createdAt: new Date().toISOString().split('T')[0],
                                                });
                                            }}
                                            disabled={submitting}
                                            className="flex-1"
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                        </div>
                    )}
                    
                    {/* Show message when no members */}
                    {showAddButton && !isTripClosed && members.length === 0 && (
                        <div className="text-center py-4 px-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Users className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-800">
                                Vui lòng thêm thành viên vào chuyến đi trước khi thêm tạm ứng
                            </p>
                        </div>
                    )}

                    {/* Advances Timeline */}
                    <TimelineView
                        expenses={[]}
                        advances={localAdvances}
                        members={members}
                        trip={trip}
                        expandedExpenses={new Set()}
                        expandedAdvances={expandedAdvances}
                        toggleExpense={() => {}}
                        toggleAdvance={toggleAdvance}
                        handleEditExpense={() => {}}
                        handleDeleteExpense={() => {}}
                        setEditingAdvance={handleEditAdvance}
                        handleDeleteAdvance={handleDeleteAdvance}
                        canEdit={canEdit}
                        isTripClosed={isTripClosed}
                        getCategoryIcon={getCategoryIcon}
                        getCategoryLabel={getCategoryLabel}
                        formatTime={formatTime}
                    />
                </div>
            )}

            {/* Edit Advance Modal */}
            {user && (
                <EditAdvanceModal
                    isOpen={!!editingAdvance}
                    onClose={() => setEditingAdvance(null)}
                    advance={editingAdvance}
                    members={members}
                    userId={user.uid}
                    tripId={trip.id}
                    onSuccess={() => {
                        if (onAdvanceUpdated) {
                            onAdvanceUpdated();
                        }
                        setEditingAdvance(null);
                    }}
                />
            )}
        </div>
    );
}
