'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { Expense, TripMember } from '@/lib/types';
import { updateExpense } from '@/lib/actions/expenses';
import { toast } from 'sonner';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members: TripMember[];
  userId: string;
  onSuccess: () => void;
}

export default function EditExpenseModal({ 
  isOpen, 
  onClose, 
  expense, 
  members, 
  userId,
  onSuccess 
}: EditExpenseModalProps) {
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      // Convert weights from weightMap to weights object
      const weights: { [memberId: string]: number } = {};
      if (expense.weightMap) {
        expense.weightMap.forEach(weightEntry => {
          weights[weightEntry.memberId] = weightEntry.weight;
        });
      }
      
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description || '',
        paidBy: expense.paidBy,
        splitMethod: expense.splitMethod,
        category: expense.category || '',
        weights: weights,
        createdAt: expense.createdAt instanceof Date 
          ? expense.createdAt.toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        isEqualSplit: expense.splitMethod === 'equal',
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

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
      formDataObj.append('tripId', expense.tripId);
      formDataObj.append('userId', userId);
      formDataObj.append('amount', amount.toString());
      formDataObj.append('description', formData.description);
      formDataObj.append('paidBy', formData.paidBy);
      formDataObj.append('splitMethod', formData.isEqualSplit ? 'equal' : 'weight');
      formDataObj.append('category', formData.category);
      formDataObj.append('createdAt', formData.createdAt);
      
      // Add weights for weighted split
      if (!formData.isEqualSplit) {
        if (Object.keys(formData.weights).length === 0) {
          members.forEach(member => {
            formDataObj.append('weightMap', JSON.stringify({
              memberId: member.id,
              weight: 1
            }));
          });
        } else {
          Object.entries(formData.weights).forEach(([memberId, weight]) => {
            formDataObj.append('weightMap', JSON.stringify({
              memberId,
              weight: weight
            }));
          });
        }
      }

      await updateExpense(expense.id, formDataObj);
      toast.success('Cập nhật chi phí thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Có lỗi xảy ra khi cập nhật chi phí');
    } finally {
      setSubmitting(false);
    }
  };

  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa chi phí"
      size="lg"
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
                  const newWeights = { ...formData.weights };
                  
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
              <div key={member.id} className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium">{member.name}</span>
                <Input
                  type="number"
                  min="0"
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
            ))}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {formData.isEqualSplit 
              ? '💡 Chia đều: Tất cả thành viên đều trả số tiền bằng nhau'
              : '💡 Theo trọng số: Đặt trọng số = 0 để loại trừ thành viên khỏi chi phí này'
            }
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang cập nhật...' : 'Cập nhật chi phí'}
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
