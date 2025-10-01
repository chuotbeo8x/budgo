'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
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
import { Select } from '@/components/ui/simple-select';
import { MapPin, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { createTrip } from '@/lib/actions/trips';
import { generateTripSlug } from '@/lib/utils/slug';
import { Group } from '@/lib/types';

interface TripCreateModalProps {
  trigger?: React.ReactNode;
  mode?: 'personal' | 'group';
  group?: Group | null;
  groups?: Group[];
  onSuccess?: (tripId: string, groupId?: string, tripSlug?: string) => void;
}

export default function TripCreateModal({ 
  trigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Tạo chuyến đi
    </Button>
  ),
  mode = 'personal',
  group = null,
  groups = [],
  onSuccess 
}: TripCreateModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    currency: 'VND',
    estimatedCostPerPerson: '',
    groupId: group?.id || '',
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Bạn chưa đăng nhập');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chuyến đi');
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      
      const slug = generateTripSlug(formData.name);
      
      const tripData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        currency: formData.currency,
        estimatedCostPerPerson: formData.estimatedCostPerPerson ? parseFloat(formData.estimatedCostPerPerson) : undefined,
        userId: user?.uid,
        slug,
      };

      // Add dates if provided
      if (formData.startDate) {
        tripData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        tripData.endDate = new Date(formData.endDate);
      }

      // Add group ID if group selected
      if (formData.groupId) {
        tripData.groupId = formData.groupId;
      }

      const result = await createTrip(tripData);

      if (result.success) {
        setOpen(false);
        setFormData({
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          currency: 'VND',
          estimatedCostPerPerson: '',
          groupId: group?.id || '',
        });
        
        if (onSuccess) {
          onSuccess(result.tripId, result.groupId, result.slug);
        } else {
          toast.success('Tạo chuyến đi thành công!');
          if (result.groupId) {
            // Need to get group slug for redirect
            router.push(`/g/${result.groupSlug}/trips/${result.slug}/manage`);
          } else {
            router.push(`/trips/${result.slug}/manage`);
          }
        }
      } else {
        toast.error(result.error || 'Có lỗi xảy ra khi tạo chuyến đi');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isGroupMode = formData.groupId !== '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="w-5 h-5 text-primary-600" />
            Tạo chuyến đi
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Tạo chuyến đi cá nhân hoặc chuyến đi nhóm để quản lý chi phí một cách linh hoạt
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên chuyến đi *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên chuyến đi"
              required
              className="focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Loại chuyến đi</Label>
            <Select 
              value={formData.groupId} 
              onChange={(e) => handleInputChange('groupId', e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500"
            >
              <option key="personal" value="">🏠 Chuyến đi cá nhân</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  👥 {g.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500">
              {groups.length > 0 
                ? 'Chọn nhóm để tạo chuyến đi nhóm, hoặc để trống để tạo chuyến đi cá nhân'
                : 'Chuyến đi cá nhân (chưa có nhóm nào)'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả về chuyến đi (tùy chọn)"
              rows={3}
              className="focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">Địa điểm</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Nơi đến (tùy chọn)"
              className="focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Tiền tệ</Label>
            <Select 
              value={formData.currency} 
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="focus:ring-primary-500 focus:border-primary-500"
            >
              <option key="VND" value="VND">VND</option>
              <option key="USD" value="USD">USD</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedCostPerPerson" className="text-sm font-medium text-gray-700">Chi phí dự kiến cho mỗi người</Label>
            <div className="relative">
              <Input
                id="estimatedCostPerPerson"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCostPerPerson}
                onChange={(e) => handleInputChange('estimatedCostPerPerson', e.target.value)}
                placeholder="Nhập chi phí dự kiến (tùy chọn)"
                className="pr-8 focus:ring-primary-500 focus:border-primary-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                {formData.currency}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Ước tính chi phí trung bình mỗi người sẽ chi trả trong chuyến đi này
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tạo...
                </div>
              ) : (
                'Tạo chuyến đi'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
