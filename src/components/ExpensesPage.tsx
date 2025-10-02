'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EditExpenseModal from '@/components/modals/EditExpenseModal';
import EditAdvanceModal from '@/components/modals/EditAdvanceModal';
import { getExpenses, addExpense, updateExpense, deleteExpense, getAdvances, addAdvance, updateAdvance, deleteAdvance } from '@/lib/actions/expenses';
import { getTripMembers } from '@/lib/actions/trips';
import { Trip, Expense, TripMember, Advance } from '@/lib/types';
import { useSettlement } from '@/hooks/useSettlement';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import SettlementSummary from '@/components/SettlementSummary';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import Link from 'next/link';
import { Tooltip } from 'react-tooltip';
import {
    Plus,
    ArrowLeft,
    User,
    DollarSign,
    Calendar,
    FileText,
    Edit,
    Trash2,
    MoreHorizontal,
    CreditCard,
    TrendingUp,
    Users,
    Tag,
    Receipt,
    ShoppingCart,
    Car,
    Home,
    Gamepad2,
    Utensils
} from 'lucide-react';

interface ExpensesPageProps {
    trip: Trip;
    expenses?: Expense[];
    advances?: Advance[];
    members?: TripMember[];
    backUrl: string;
    backLabel: string;
    showAddButton?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export default function ExpensesPage({
    trip,
    expenses: initialExpenses,
    advances: initialAdvances,
    members: initialMembers,
    backUrl,
    backLabel,
    showAddButton = true,
    canEdit = true,
    canDelete = true
}: ExpensesPageProps) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses || []);
    const [advances, setAdvances] = useState<Advance[]>(initialAdvances || []);
    const [members, setMembers] = useState<TripMember[]>(initialMembers || []);
    const [loadingData, setLoadingData] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddAdvanceForm, setShowAddAdvanceForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'advances'>('expenses');
    const { paymentStatus, updatePaymentStatus, updating, loading: paymentStatusLoading } = usePaymentStatus(trip?.id, user?.uid);
    
    // Check if trip is closed
    const isTripClosed = trip?.status === 'closed';

    // Ref for date input
    const dateInputRef = useRef<HTMLInputElement>(null);


    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paidBy: '',
        splitMethod: 'weight' as 'equal' | 'weight', // Always weight, but can be equal split
        category: '',
        weights: {} as { [memberId: string]: number },
        createdAt: '', // Will be set in useEffect
        isEqualSplit: false, // New field for equal split checkbox
    });

    // Advance form state
    const [advanceFormData, setAdvanceFormData] = useState({
        amount: '',
        description: '',
        paidBy: '',
        createdAt: '', // Will be set in useEffect
    });

    // Set default date after mount to avoid hydration mismatch
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, createdAt: today }));
        setAdvanceFormData(prev => ({ ...prev, createdAt: today }));
    }, []);

    useEffect(() => {
        // Always load data to ensure we have the latest data with memberIdsAtCreation
        if (trip?.id && user) {
            loadData();
        }
    }, [trip?.id, user?.uid]);

    const loadData = async () => {
        try {
            setLoadingData(true);
            const [expensesData, advancesData, membersData] = await Promise.all([
                getExpenses(trip.id),
                getAdvances(trip.id),
                getTripMembers(trip.id)
            ]);
            setExpenses(expensesData);
            setAdvances(advancesData);
            setMembers(membersData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip || !user) return;

        // Get form data directly from form element
        const formElement = e.target as HTMLFormElement;
        const formDataFromElement = new FormData(formElement);
        const selectedDate = formDataFromElement.get('createdAt') as string;

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

            await addExpense(formDataObj);
            toast.success('Thêm chi phí thành công!');
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
            loadData();
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Có lỗi xảy ra khi thêm chi phí');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip || !user || !editingExpense) return;

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

            await updateExpense(editingExpense.id, formDataObj);
            toast.success('Cập nhật chi phí thành công!');
            setShowAddForm(false);
            setEditingExpense(null);
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
            loadData();
        } catch (error) {
            console.error('Error updating expense:', error);
            toast.error('Có lỗi xảy ra khi cập nhật chi phí');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteExpense = async (expenseId: string) => {
        try {
            await deleteExpense(expenseId, user?.uid || '');
            toast.success('Xóa chi phí thành công!');
            loadData();
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast.error('Có lỗi xảy ra khi xóa chi phí');
        }
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleEditAdvance = (advance: Advance) => {
        setEditingAdvance(advance);
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

            await addAdvance(formDataObj);
            toast.success('Thêm tạm ứng thành công!');
            setShowAddAdvanceForm(false);
            setAdvanceFormData({
                amount: '',
                description: '',
                paidBy: '',
                createdAt: new Date().toISOString().split('T')[0],
            });
            loadData();
        } catch (error) {
            console.error('Error adding advance:', error);
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
        return categoryIcons[category] || Tag;
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

    // Get split details for display
    const getSplitDetails = (expense: Expense) => {
        if (expense.splitMethod === 'equal') {
            if (members.length === 0) {
                return {
                    method: 'Chia đều',
                    amountPerPerson: 0,
                    totalPeople: 0,
                    description: 'Chưa có thành viên'
                };
            }
            const amountPerPerson = expense.amount / members.length;
            return {
                method: 'Chia đều',
                amountPerPerson: amountPerPerson,
                totalPeople: members.length,
                description: `${formatCurrency(amountPerPerson, trip.currency)}/người`
            };
        } else if (expense.splitMethod === 'weight' && expense.weightMap && expense.weightMap.length > 0) {
            const totalWeight = expense.weightMap.reduce((sum, entry) => sum + entry.weight, 0);
            if (totalWeight === 0) {
                return {
                    method: 'Theo trọng số',
                    amountPerPerson: 0,
                    totalPeople: expense.weightMap.length,
                    description: 'Chưa có trọng số'
                };
            }

            // For weighted split, we need to show different amounts for different weight groups
            // This is just for the summary - the actual display will be handled in the UI
            const avgAmountPerPerson = expense.amount / totalWeight;
            return {
                method: 'Theo trọng số',
                amountPerPerson: avgAmountPerPerson,
                totalPeople: expense.weightMap.length,
                description: `Theo trọng số (${expense.weightMap.length} người)`
            };
        } else if (expense.splitMethod === 'weight') {
            // Weight method but no weightMap
            return {
                method: 'Theo trọng số',
                amountPerPerson: 0,
                totalPeople: 0,
                description: 'Chưa có trọng số'
            };
        }

        return {
            method: 'Không xác định',
            amountPerPerson: 0,
            totalPeople: 0,
            description: 'Không có thông tin'
        };
    };

    // Use settlement hook for optimized calculations
    const { settlements, totalExpense, totalAdvance } = useSettlement(expenses, advances, members);

    const handlePaymentStatusChange = (memberId: string, status: boolean) => {
        updatePaymentStatus(memberId, status);
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-main flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-main">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <Link href={backUrl}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {backLabel}
                            </Button>
                        </Link>
                        
                        {/* Trip Closed Warning - Compact */}
                        {isTripClosed && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-yellow-800 text-sm font-medium">Chuyến đi đã chốt</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-white text-emerald-700 rounded-lg shadow mb-2 border border-white/70">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                            Chi phí chuyến đi
                        </h1>
                        <p className="text-sm text-gray-600 mb-4">
                            {trip.name}
                        </p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Tổng chi phí</p>
                                    <p className="text-3xl font-bold">{formatCurrency(totalExpense, trip.currency)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Tổng tạm ứng</p>
                                    <p className="text-3xl font-bold">{formatCurrency(totalAdvance, trip.currency)}</p>
                                </div>
                                <CreditCard className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Số khoản chi</p>
                                    <p className="text-3xl font-bold">{expenses.length}</p>
                                </div>
                                <Receipt className="w-8 h-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Trung bình/người</p>
                                    <p className="text-3xl font-bold">
                                        {members.length > 0 ? formatCurrency(totalExpense / members.length, trip.currency) : '0 ₫'}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Tab Navigation */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('expenses')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'expenses'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <Receipt className="w-4 h-4 inline mr-2" />
                                    Chi phí ({expenses.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('advances')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === 'advances'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <CreditCard className="w-4 h-4 inline mr-2" />
                                    Tạm ứng ({advances.length})
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'expenses' && showAddButton && (
                                    <Button
                                        onClick={() => setShowAddForm(true)}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        size="sm"
                                        disabled={isTripClosed}
                                        title={isTripClosed ? 'Chuyến đi đã được chốt, không thể thêm chi phí' : ''}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm chi phí
                                    </Button>
                                )}
                                {activeTab === 'advances' && showAddButton && (
                                    <Button
                                        onClick={() => setShowAddAdvanceForm(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        size="sm"
                                        disabled={isTripClosed}
                                        title={isTripClosed ? 'Chuyến đi đã được chốt, không thể thêm tạm ứng' : ''}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm tạm ứng
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    {/* Add Expense Form */}
                    {showAddForm && (
                        <Card className="mb-6 mx-6 shadow-md">
                            <CardHeader>
                                <CardTitle>{editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={editingExpense ? handleUpdateExpense : handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="amount" className="block mb-2">Số tiền *</Label>
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
                                        <div>
                                            <Label htmlFor="paidBy" className="block mb-2">Người chi *</Label>
                                            <select
                                                id="paidBy"
                                                value={formData.paidBy}
                                                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                                                className="w-full p-2 border rounded-md"
                                                required
                                            >
                                                <option value="">Chọn người chi</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="createdAt" className="block mb-2">Ngày tạo *</Label>
                                            <Input
                                                ref={dateInputRef}
                                                id="createdAt"
                                                name="createdAt"
                                                type="date"
                                                value={formData.createdAt}
                                                onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
                                                className="w-full p-2 border rounded-md"
                                                required
                                                disabled={submitting}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="block mb-2">Mô tả</Label>
                                        <Input
                                            id="description"
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Mô tả chi phí..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="category" className="block mb-2">Danh mục</Label>
                                        <select
                                            id="category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full p-2 border rounded-md"
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

                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <Label>Trọng số cho từng thành viên</Label>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="isEqualSplit"
                                                    checked={formData.isEqualSplit}
                                                    onChange={(e) => {
                                                        const isEqual = e.target.checked;
                                                        let newWeights = { ...formData.weights };
                                                        
                                                        if (isEqual) {
                                                            // Set all members to weight 1 for equal split
                                                            members.forEach(member => {
                                                                newWeights[member.id] = 1;
                                                            });
                                                        }
                                                        // When unchecking, keep the current values (don't reset to 0)
                                                        
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
                                        
                                        <div className="space-y-2">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">{member.name}</span>
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
                                                            className="w-20"
                                                            placeholder="0"
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
                                        
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formData.isEqualSplit 
                                                ? '💡 Chia đều: Tất cả thành viên đều trả số tiền bằng nhau'
                                                : '💡 Theo trọng số: Đặt trọng số = 0 để loại trừ thành viên khỏi chi phí này'
                                            }
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={submitting}>
                                            {submitting
                                                ? (editingExpense ? 'Đang cập nhật...' : 'Đang thêm...')
                                                : (editingExpense ? 'Cập nhật chi phí' : 'Thêm chi phí')
                                            }
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setEditingExpense(null);
                                                setFormData({
                                                    amount: '',
                                                    description: '',
                                                    paidBy: '',
                                                    splitMethod: 'weight',
                                                    isEqualSplit: false,
                                                    category: '',
                                                    weights: {},
                                                    createdAt: '',
                                                });
                                            }}
                                            disabled={submitting}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                    {/* Add Advance Form */}
                    {showAddAdvanceForm && activeTab === 'advances' && (
                        <Card className="mb-6 mx-6 shadow-md">
                            <CardHeader>
                                <CardTitle>Thêm tạm ứng mới</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmitAdvance} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="advanceAmount" className="block mb-2">Số tiền *</Label>
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
                                        <div>
                                            <Label htmlFor="advancePaidBy" className="block mb-2">Người ứng *</Label>
                                            <select
                                                id="advancePaidBy"
                                                value={advanceFormData.paidBy}
                                                onChange={(e) => setAdvanceFormData({ ...advanceFormData, paidBy: e.target.value })}
                                                className="w-full p-2 border rounded-md"
                                                required
                                            >
                                                <option value="">Chọn người ứng</option>
                                                {members.map((member) => (
                                                    <option key={member.id} value={member.id}>
                                                        {member.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="advanceCreatedAt" className="block mb-2">Ngày tạo *</Label>
                                            <Input
                                                id="advanceCreatedAt"
                                                type="date"
                                                value={advanceFormData.createdAt}
                                                onChange={(e) => setAdvanceFormData({ ...advanceFormData, createdAt: e.target.value })}
                                                className="w-full p-2 border rounded-md"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="advanceDescription" className="block mb-2">Mô tả</Label>
                                        <Input
                                            id="advanceDescription"
                                            type="text"
                                            value={advanceFormData.description}
                                            onChange={(e) => setAdvanceFormData({ ...advanceFormData, description: e.target.value })}
                                            placeholder="Mô tả tạm ứng..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={submitting}>
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
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                    <CardContent>
                        {activeTab === 'expenses' ? (
                            // Expenses Tab Content
                            expenses.length === 0 ? (
                                <div className="text-center py-10">
                                    <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có chi phí nào</h3>
                                    <p className="text-sm text-gray-600 mb-5">Bắt đầu thêm chi phí cho chuyến đi</p>
                                    {showAddButton && (
                                        <Button
                                            onClick={() => setShowAddForm(true)}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm chi phí đầu tiên
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày tạo</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người chi</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số tiền</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Chia tiền</th>
                                                {(canEdit || canDelete) && (
                                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map((expense) => {
                                                const paidByMember = members.find(m => m.id === expense.paidBy);
                                                const isOwner = user?.uid === trip.ownerId;
                                                const CategoryIcon = getCategoryIcon(expense.category || '');
                                                const splitDetails = getSplitDetails(expense);

                                                return (
                                                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-main">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs md:text-sm text-gray-600">
                                                                    {formatDate(expense.createdAt)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-[10px]">
                                                                        {(paidByMember?.name || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        {paidByMember?.name || 'Không xác định'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-600">
                                                                            {expense.description || 'Không có mô tả'}
                                                                        </span>
                                                                        <span className="text-[11px] italic text-gray-400 flex items-center gap-1">
                                                                            <CategoryIcon className="w-3 h-3 text-gray-500" />
                                                                             {getCategoryLabel(expense.category || '')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                                <span className="text-base font-semibold text-green-700">
                                                                    {formatCurrency(expense.amount, trip.currency)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-orange-500" />
                                                                    <div className="flex flex-col">
                                                                        <div className="mt-1">
                                                                            {expense.splitMethod === 'equal' ? (
                                                                                <div className="text-xs md:text-sm font-semibold text-gray-600">
                                                                                    {formatCurrency(splitDetails.amountPerPerson, trip.currency)}/người
                                                                                </div>
                                                                            ) : (
                                                                                (() => {
                                                                                    if (!expense.weightMap || expense.weightMap.length === 0) {
                                                                                        return (
                                                                                            <div className="text-xs md:text-sm font-semibold text-orange-600">
                                                                                                {formatCurrency(splitDetails.amountPerPerson, trip.currency)}/người
                                                                                            </div>
                                                                                        );
                                                                                    }

                                                                                    const totalWeight = members.reduce((sum, member) => {
                                                                                        const weightEntry = expense.weightMap?.find(w => w.memberId === member.id);
                                                                                        const weight = weightEntry?.weight ?? 1;
                                                                                        return sum + (weight > 0 ? weight : 0);
                                                                                    }, 0);

                                                                                    const weightGroups = members.reduce((groups, member) => {
                                                                                        const weightEntry = expense.weightMap?.find(w => w.memberId === member.id);
                                                                                        const weight = weightEntry?.weight ?? 1;

                                                                                        if (weight > 0) {
                                                                                            if (!groups[weight]) {
                                                                                                groups[weight] = [];
                                                                                            }
                                                                                            groups[weight].push(member);
                                                                                        }
                                                                                        return groups;
                                                                                    }, {} as { [weight: number]: any[] });

                                                                                    return (
                                                                                        <div className="space-y-1">
                                                                                            {Object.entries(weightGroups)
                                                                                                .sort(([a], [b]) => Number(a) - Number(b))
                                                                                                .map(([weight, membersInGroup]) => {
                                                                                                    const amountPerPerson = (expense.amount * Number(weight)) / totalWeight;
                                                                                                    const weightValue = Number(weight);
                                                                                                    let weightColor = 'text-gray-600';
                                                                                                    if (weightValue === 2) {
                                                                                                        weightColor = 'text-orange-600';
                                                                                                    } else if (weightValue >= 3) {
                                                                                                        weightColor = 'text-red-600';
                                                                                                    }

                                                                                                    return (
                                                                                                        <div key={weight}>
                                                                                                            <span
                                                                                                                className={`text-xs md:text-sm font-semibold cursor-pointer hover:text-gray-700 transition-colors ${weightColor}`}
                                                                                                                data-tooltip-id={`weight-${expense.id}-${weight}`}
                                                                                                                data-tooltip-content={`Trọng số ${weight}: ${membersInGroup.map(m => m.name).join(', ')}`}
                                                                                                            >
                                                                                                                {formatCurrency(amountPerPerson, trip.currency)}/người
                                                                                                            </span>
                                                                                                            <Tooltip
                                                                                                                id={`weight-${expense.id}-${weight}`}
                                                                                                                place="top"
                                                                                                                style={{
                                                                                                                    backgroundColor: '#1f2937',
                                                                                                                    color: 'white',
                                                                                                                    fontSize: '12px',
                                                                                                                    padding: '8px 12px',
                                                                                                                    borderRadius: '6px',
                                                                                                                    maxWidth: '300px',
                                                                                                                    zIndex: 50
                                                                                                                }}
                                                                                                            />
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                        </div>
                                                                                    );
                                                                                })()
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {(canEdit || canDelete) && (
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {canEdit && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditExpense(expense)}
                                                                            className="h-8 w-8 p-0"
                                                                            disabled={isTripClosed}
                                                                            title={isTripClosed ? 'Chuyến đi đã được chốt, không thể sửa chi phí' : ''}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                    {canDelete && (
                                                                        <DeleteConfirmDialog
                                                                            trigger={
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                    disabled={isTripClosed}
                                                                                    title={isTripClosed ? 'Chuyến đi đã được lưu trữ, không thể xóa chi phí' : ''}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            }
                                                                            title="Xóa chi phí"
                                                                            description="Bạn có chắc chắn muốn xóa chi phí này?"
                                                                            confirmText="Xóa"
                                                                            cancelText="Hủy"
                                                                            onConfirm={() => handleDeleteExpense(expense.id)}
                                                                            loadingText="Đang xóa..."
                                                                        />
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            // Advances Tab Content
                            advances.length === 0 ? (
                                <div className="text-center py-10">
                                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có tạm ứng nào</h3>
                                    <p className="text-sm text-gray-600 mb-5">Thêm các khoản tạm ứng để cân bằng chi phí</p>
                                    {showAddButton && (
                                        <Button
                                            onClick={() => setShowAddAdvanceForm(true)}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Thêm tạm ứng đầu tiên
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày tạo</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Người ứng</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Số tiền</th>
                                                {(canEdit || canDelete) && (
                                                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {advances.map((advance) => {
                                                const paidByMember = members.find(m => m.id === advance.paidBy || m.id === (advance as any).memberId);
                                                return (
                                                    <tr key={advance.id} className="border-b border-gray-100 hover:bg-main">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs md:text-sm text-gray-600">
                                                                    {formatDate(advance.createdAt)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                                                    <span className="text-white font-semibold text-[10px]">
                                                                        {(paidByMember?.name || 'U').charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 text-sm">
                                                                        {paidByMember?.name || 'Không xác định'}
                                                                    </p>
                                                                    <p className="text-xs md:text-sm text-gray-600 truncate" title={advance.description || 'Không có mô tả'}>
                                                                        {advance.description || 'Không có mô tả'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                                <span className="text-base font-semibold text-blue-700">
                                                                    {formatCurrency(advance.amount, trip.currency)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {(canEdit || canDelete) && (
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {canEdit && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditAdvance(advance)}
                                                                            className="h-8 w-8 p-0 mr-2"
                                                                            disabled={isTripClosed}
                                                                            title={isTripClosed ? 'Chuyến đi đã được chốt, không thể sửa tạm ứng' : ''}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                    {canDelete && (
                                                                        <DeleteConfirmDialog
                                                                            trigger={
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                    disabled={isTripClosed}
                                                                                    title={isTripClosed ? 'Chuyến đi đã được lưu trữ, không thể xóa tạm ứng' : ''}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            }
                                                                            title="Xóa tạm ứng"
                                                                            description="Bạn có chắc chắn muốn xóa tạm ứng này?"
                                                                            confirmText="Xóa"
                                                                            cancelText="Hủy"
                                                                            onConfirm={async () => {
                                                                                if (!user) return;
                                                                                try {
                                                                                    await deleteAdvance(advance.id!, user.uid);
                                                                                    toast.success('Xóa tạm ứng thành công!');
                                                                                    loadData();
                                                                                } catch (error) {
                                                                                    console.error('Error deleting advance:', error);
                                                                                    toast.error('Có lỗi xảy ra khi xóa tạm ứng');
                                                                                }
                                                                            }}
                                                                            loadingText="Đang xóa..."
                                                                        />
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>


                {/* Settlement Summary */}
                <SettlementSummary
                    settlements={settlements}
                    currency={trip.currency}
                    showDetails={true}
                    showToggle={true}
                    isOwner={user?.uid === trip.ownerId}
                    paymentStatus={paymentStatus}
                    onPaymentStatusChange={handlePaymentStatusChange}
                    updating={updating}
                    loading={paymentStatusLoading}
                />
            </div>

            {/* Edit Expense Modal */}
            {user && (
                <EditExpenseModal
                    isOpen={!!editingExpense}
                    onClose={() => setEditingExpense(null)}
                    expense={editingExpense}
                    members={members}
                    userId={user.uid}
                    onSuccess={() => {
                        loadData();
                        setEditingExpense(null);
                    }}
                />
            )}

            {/* Edit Advance Modal */}
            {user && (
                <EditAdvanceModal
                    isOpen={!!editingAdvance}
                    onClose={() => setEditingAdvance(null)}
                    advance={editingAdvance}
                    members={members}
                    userId={user.uid}
                    onSuccess={() => {
                        loadData();
                        setEditingAdvance(null);
                    }}
                />
            )}
        </div>
    );
}
