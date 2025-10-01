'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addExpense } from '@/lib/actions/expenses';
import { Trip, TripMember } from '@/lib/types';
import { toast } from 'sonner';
import {
    Plus,
    DollarSign,
    FileText,
    Tag,
    Calendar,
    Users
} from 'lucide-react';

interface AddExpenseModalProps {
    trigger?: React.ReactNode;
    trip: Trip;
    members: TripMember[];
    onExpenseAdded?: (expense: any) => void;
}

export default function AddExpenseModal({
    trigger,
    trip,
    members,
    onExpenseAdded
}: AddExpenseModalProps) {
    
    // Default trigger với disabled state
    const defaultTrigger = (
        <Button className="w-full" disabled={members.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm chi phí
        </Button>
    );
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Prevent modal from opening if no members
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí');
            return;
        }
        setOpen(newOpen);
    };
    
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        paidBy: '',
        category: 'food',
        createdAt: new Date().toISOString().split('T')[0], // For display only
        isEqualSplit: false,
    });

    // Set default date after mount to avoid hydration mismatch
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, createdAt: today }));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !trip?.id) return;

        if (members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí');
            return;
        }

        try {
            setSubmitting(true);
            
            // Create FormData to match server action signature
            const formDataObj = new FormData();
            formDataObj.append('amount', formData.amount);
            formDataObj.append('description', formData.description);
            formDataObj.append('paidBy', formData.paidBy);
            formDataObj.append('category', formData.category);
            formDataObj.append('splitMethod', formData.isEqualSplit ? 'equal' : 'weight');
            formDataObj.append('createdAt', formData.createdAt); // Date string from form
            formDataObj.append('tripId', trip.id);

            const newExpense = await addExpense(formDataObj);
            toast.success('Thêm chi phí thành công');
            
            setFormData({
                description: '',
                amount: '',
                paidBy: '',
                category: 'food',
                createdAt: new Date().toISOString().split('T')[0],
                isEqualSplit: false,
            });
            setOpen(false);
            
            if (onExpenseAdded) {
                onExpenseAdded(newExpense);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            toast.error('Có lỗi xảy ra khi thêm chi phí');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            description: '',
            amount: '',
            paidBy: '',
            category: 'food',
            createdAt: new Date().toISOString().split('T')[0],
            isEqualSplit: false,
        });
        setOpen(false);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'food': return <FileText className="w-4 h-4" />;
            case 'transport': return <DollarSign className="w-4 h-4" />;
            case 'accommodation': return <Tag className="w-4 h-4" />;
            case 'entertainment': return <Tag className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'food': return 'Ăn uống';
            case 'transport': return 'Di chuyển';
            case 'accommodation': return 'Nơi ở';
            case 'entertainment': return 'Giải trí';
            default: return 'Khác';
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                        Thêm chi phí mới
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                        Thêm chi phí mới cho chuyến đi này
                    </DialogDescription>
                </DialogHeader>
                
                {members.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thành viên</h3>
                        <p className="text-gray-600 mb-4">
                            Vui lòng thêm thành viên vào chuyến đi trước khi thêm chi phí
                        </p>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                        >
                            Đóng
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả *</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Nhập mô tả chi phí"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Số tiền *</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="Nhập số tiền"
                                required
                                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paidBy" className="text-sm font-medium text-gray-700">Người chi *</Label>
                            <select
                                id="paidBy"
                                name="paidBy"
                                value={formData.paidBy}
                                onChange={handleInputChange}
                                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white text-sm"
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

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium text-gray-700">Danh mục</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'food', label: 'Ăn uống', icon: '🍽️' },
                                    { value: 'transport', label: 'Di chuyển', icon: '🚗' },
                                    { value: 'accommodation', label: 'Nơi ở', icon: '🏨' },
                                    { value: 'entertainment', label: 'Giải trí', icon: '🎮' }
                                ].map((cat) => (
                                    <label key={cat.value} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={cat.value}
                                            checked={formData.category === cat.value}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium">{cat.icon} {cat.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="createdAt" className="text-sm font-medium text-gray-700">Ngày *</Label>
                            <Input
                                id="createdAt"
                                name="createdAt"
                                type="date"
                                value={formData.createdAt}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                            <input
                                type="checkbox"
                                id="isEqualSplit"
                                name="isEqualSplit"
                                checked={formData.isEqualSplit}
                                onChange={handleInputChange}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <Label htmlFor="isEqualSplit" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Chia đều cho tất cả thành viên
                            </Label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1" variant="default">
                                {submitting ? 'Đang thêm...' : 'Thêm chi phí'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Hủy
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
