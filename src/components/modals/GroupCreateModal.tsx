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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Tạo nhóm mới
          </DialogTitle>
          <DialogDescription>
            Tạo nhóm để quản lý chuyến đi và chia sẻ chi phí với bạn bè.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên nhóm *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên nhóm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả về nhóm (tùy chọn)"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Loại nhóm</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div className="font-medium">Public</div>
                  <div className="text-sm text-gray-500">Ai cũng có thể tìm thấy và tham gia</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="close" id="close" />
                <Label htmlFor="close" className="flex-1 cursor-pointer">
                  <div className="font-medium">Close</div>
                  <div className="text-sm text-gray-500">Chỉ thành viên mới có thể mời người khác</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="secret" id="secret" />
                <Label htmlFor="secret" className="flex-1 cursor-pointer">
                  <div className="font-medium">Secret</div>
                  <div className="text-sm text-gray-500">Chỉ thành viên mới biết sự tồn tại</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
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
