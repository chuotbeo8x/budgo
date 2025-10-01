'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createGroup } from '@/lib/actions/groups';
import { generateGroupSlug } from '@/lib/utils/slug';
import { useAuth } from '@/components/auth/AuthProvider';

interface GroupCreateModalProps {
  trigger?: React.ReactNode;
  onSuccess?: (groupId: string) => void;
}

export default function GroupCreateModal({ 
  trigger = (
    <Button size="sm" className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Tạo nhóm
    </Button>
  ),
  onSuccess 
}: GroupCreateModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'close' | 'secret',
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setLoading(true);
      
      const slug = generateGroupSlug(formData.name);
      
      const result = await createGroup({
        userId: user?.uid,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        slug,
      });

      if (result.success) {
        setOpen(false);
        setFormData({ name: '', description: '', type: 'public' });
        
        if (onSuccess) {
          onSuccess(result.groupId);
        } else {
          toast.success('Tạo nhóm thành công!');
          router.push(`/g/${result.groupId}`);
        }
      } else {
        toast.error(result.error || 'Có lỗi xảy ra khi tạo nhóm');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="w-5 h-5 text-primary-600" />
            Tạo nhóm mới
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Tạo nhóm để quản lý chuyến đi và chia sẻ chi phí với bạn bè.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên nhóm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên nhóm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả về nhóm (tùy chọn)"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Loại nhóm</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="public" id="public" className="text-primary-600" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Public</div>
                  <div className="text-sm text-gray-500">Ai cũng có thể tìm thấy và tham gia</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="close" id="close" className="text-primary-600" />
                <Label htmlFor="close" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Close</div>
                  <div className="text-sm text-gray-500">Chỉ thành viên mới có thể mời người khác</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                <RadioGroupItem value="secret" id="secret" className="text-primary-600" />
                <Label htmlFor="secret" className="flex-1 cursor-pointer">
                  <div className="font-medium text-gray-900">Secret</div>
                  <div className="text-sm text-gray-500">Chỉ thành viên mới biết sự tồn tại</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} variant="default">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo...
                </div>
              ) : (
                'Tạo nhóm'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
