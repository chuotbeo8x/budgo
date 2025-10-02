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
  tripId?: string; // Add tripId as fallback
  onSuccess: () => void;
}

export default function EditAdvanceModal({ 
  isOpen, 
  onClose, 
  advance, 
  members, 
  userId,
  tripId,
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
      // Debug: Log the entire advance object
      console.log('🔍 EditAdvanceModal - advance object:', advance);
      console.log('🔍 EditAdvanceModal - advance.tripId:', advance.tripId);
      
      // Parse createdAt properly
      let createdAtDate: Date;
      if (advance.createdAt instanceof Date) {
        createdAtDate = advance.createdAt;
      } else if (advance.createdAt && typeof advance.createdAt === 'object' && advance.createdAt.seconds) {
        // Firestore Timestamp
        createdAtDate = new Date(advance.createdAt.seconds * 1000 + (advance.createdAt.nanoseconds || 0) / 1000000);
      } else if (typeof advance.createdAt === 'string') {
        createdAtDate = new Date(advance.createdAt);
      } else {
        createdAtDate = new Date();
      }

      setFormData({
        amount: advance.amount.toString(),
        description: advance.description || '',
        paidBy: advance.paidBy,
        createdAt: createdAtDate.toISOString().split('T')[0],
      });
    }
  }, [advance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advance) return;

    // Debug: Check if advance has tripId
    const finalTripId = advance.tripId || tripId;
    if (!finalTripId) {
      console.error('Advance missing tripId:', advance);
      console.error('Fallback tripId also missing:', tripId);
      toast.error('Lỗi: Không tìm thấy ID chuyến đi');
      return;
    }

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
      
      // Debug: Log the values being sent
      console.log('🔍 Update values:');
      console.log('  tripId:', finalTripId);
      console.log('  userId:', userId);
      console.log('  amount:', amount.toString());
      console.log('  description:', formData.description);
      console.log('  paidBy:', formData.paidBy);
      console.log('  paidTo:', advance.paidTo);
      console.log('  createdAt:', formData.createdAt);
      
      // Try using object instead of FormData
      const updateData = {
        tripId: finalTripId,
        userId: userId,
        amount: amount.toString(),
        description: formData.description,
        paidBy: formData.paidBy,
        paidTo: advance.paidTo,
        createdAt: formData.createdAt
      };
      
      console.log('🔍 Update data object:', updateData);

      await updateAdvance(advance.id, updateData);
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
