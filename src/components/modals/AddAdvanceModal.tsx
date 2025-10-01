'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addAdvance } from '@/lib/actions/expenses';
import { Trip, TripMember } from '@/lib/types';
import { toast } from 'sonner';
import {
    Plus,
    CreditCard,
    DollarSign,
    User,
    Calendar
} from 'lucide-react';

interface AddAdvanceModalProps {
    trigger?: React.ReactNode;
    trip: Trip;
    members: TripMember[];
    onAdvanceAdded?: (advance: any) => void;
}

export default function AddAdvanceModal({
    trigger,
    trip,
    members,
    onAdvanceAdded
}: AddAdvanceModalProps) {
    
    // Default trigger với disabled state
    const defaultTrigger = (
        <Button className="w-full" disabled={members.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tạm ứng
        </Button>
    );
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Prevent modal from opening if no members
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen && members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm tạm ứng');
            return;
        }
        setOpen(newOpen);
    };
    
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        paidBy: '',
        createdAt: new Date().toISOString().split('T')[0],
    });

    // Set default date after mount to avoid hydration mismatch
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, createdAt: today }));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !trip?.id) return;

        if (members.length === 0) {
            toast.error('Vui lòng thêm thành viên vào chuyến đi trước khi thêm tạm ứng');
            return;
        }

        try {
            setSubmitting(true);
            
            const formDataObj = new FormData();
            formDataObj.append('tripId', trip.id);
            formDataObj.append('userId', user.uid);
            formDataObj.append('amount', formData.amount);
            formDataObj.append('description', formData.description);
            formDataObj.append('paidBy', formData.paidBy);
            formDataObj.append('paidTo', trip.ownerId); // Tạm ứng luôn cho chủ chuyến đi
            formDataObj.append('createdAt', formData.createdAt);

            const result = await addAdvance(formDataObj);
            toast.success('Thêm tạm ứng thành công');
            
            setFormData({
                amount: '',
                description: '',
                paidBy: '',
                createdAt: new Date().toISOString().split('T')[0],
            });
            setOpen(false);
            
            if (onAdvanceAdded) {
                onAdvanceAdded(result);
            }
        } catch (error) {
            console.error('Error adding advance:', error);
            toast.error('Có lỗi xảy ra khi thêm tạm ứng');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            amount: '',
            description: '',
            paidBy: '',
            createdAt: new Date().toISOString().split('T')[0],
        });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                        Thêm tạm ứng mới
                    </DialogTitle>
                    <DialogDescription>
                        Thêm tạm ứng mới cho chuyến đi này
                    </DialogDescription>
                </DialogHeader>
                
                {members.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thành viên</h3>
                        <p className="text-gray-600 mb-4">
                            Vui lòng thêm thành viên vào chuyến đi trước khi thêm tạm ứng
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Số tiền *</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="Nhập số tiền tạm ứng"
                                required
                            />
                        </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả *</Label>
                        <Input
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Nhập mô tả tạm ứng"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paidBy">Người ứng *</Label>
                        <select
                            id="paidBy"
                            name="paidBy"
                            value={formData.paidBy}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                            required
                        >
                            <option value="">Chọn người ứng</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name || member.ghostName || 'Unknown'}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Tạm ứng sẽ được ghi nhận cho chủ chuyến đi
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="createdAt">Ngày *</Label>
                        <Input
                            id="createdAt"
                            name="createdAt"
                            type="date"
                            value={formData.createdAt}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                        <div className="flex space-x-2 pt-4">
                            <Button type="submit" disabled={submitting} className="flex-1">
                                {submitting ? 'Đang thêm...' : 'Thêm tạm ứng'}
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
