'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Advance, TripMember } from '@/lib/types';
import { updateAdvance } from '@/lib/actions/expenses';
import { toast } from 'sonner';

interface EditAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advance: Advance | null;
  members: TripMember[];
  userId: string;
  onSuccess: () => void;
}

export default function EditAdvanceModal({ 
  isOpen, 
  onClose, 
  advance, 
  members, 
  userId,
  onSuccess 
}: EditAdvanceModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    paidBy: '',
    createdAt: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (advance) {
      setFormData({
        amount: advance.amount.toString(),
        description: advance.description || '',
        paidBy: advance.paidBy,
        createdAt: advance.createdAt instanceof Date 
          ? advance.createdAt.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [advance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advance) return;

    // Parse amount - remove dots and convert to number
    const cleanAmount = formData.amount.replace(/\./g, '');
    const amount = parseFloat(cleanAmount);
    
    // Validate form
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!formData.paidBy) {
      toast.error('Vui lòng chọn người ứng');
      return;
    }

    try {
      setSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append('tripId', advance.tripId);
      formDataObj.append('userId', userId);
      formDataObj.append('amount', amount.toString());
      formDataObj.append('description', formData.description);
      formDataObj.append('paidBy', formData.paidBy);
      formDataObj.append('paidTo', advance.paidTo); // Keep existing paidTo
      formDataObj.append('createdAt', formData.createdAt);

      await updateAdvance(advance.id, formDataObj);
      toast.success('Cập nhật tạm ứng thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating advance:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tạm ứng');
    } finally {
      setSubmitting(false);
    }
  };

  if (!advance) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa tạm ứng"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="paidBy" className="block mb-2">Người ứng *</Label>
            <select
              id="paidBy"
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
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
            <Label htmlFor="createdAt" className="block mb-2">Ngày tạo *</Label>
            <Input
              id="createdAt"
              name="createdAt"
              type="date"
              value={formData.createdAt}
              onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
              className="w-full p-2 border rounded-md"
              required
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
            placeholder="Mô tả tạm ứng..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang cập nhật...' : 'Cập nhật tạm ứng'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </Button>
        </div>
      </form>
    </Modal>
  );
}
