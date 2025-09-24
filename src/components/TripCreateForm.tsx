'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Group } from '@/lib/types';
import { generateTripSlug } from '@/lib/utils/slug';
import { createTrip } from '@/lib/actions/trips';
import { toast } from 'sonner';
import { Calendar, DollarSign, FileText, MapPin, Tag, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

type Mode = 'personal' | 'group';

interface TripCreateFormProps {
  mode: Mode;
  group?: Group | null;
  onCancel: () => void;
  onSuccess: (slug: string) => void;
}

export default function TripCreateForm({ mode, group, onCancel, onSuccess }: TripCreateFormProps) {
  const { user, loading } = useAuth();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    currency: 'VND',
    category: '',
    coverUrl: '',
    costPerPersonPlanned: ''
  });
  const [generatedSlug, setGeneratedSlug] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name') {
      const slug = generateTripSlug(value);
      setGeneratedSlug(slug || 'trip-' + Date.now());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (loading) return;
      if (!user?.uid) {
        toast.error('Vui lòng đăng nhập để tạo chuyến đi');
        return;
      }
      setCreating(true);
      const payload: any = {
        name: formData.name,
        description: formData.description,
        destination: formData.destination,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        currency: formData.currency,
        category: formData.category,
        coverUrl: formData.coverUrl,
        userId: user.uid,
      };
      if (formData.costPerPersonPlanned) {
        const val = Number(formData.costPerPersonPlanned);
        if (!Number.isNaN(val) && val >= 0) payload.costPerPersonPlanned = val;
      }
      if (mode === 'group' && group?.id) {
        payload.groupId = group.id;
      }
      const result = await createTrip(payload);
      if (result.success) {
        toast.success('Tạo chuyến đi thành công!');
        onSuccess(result.slug);
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi tạo chuyến đi');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Thông tin cơ bản
              </CardTitle>
              <CardDescription>Nhập thông tin cơ bản về chuyến đi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tên chuyến đi *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ví dụ: Du lịch Đà Lạt cuối tuần"
                  required
                  className="mt-2"
                />
                {generatedSlug && (
                  <p className="text-xs text-gray-500 mt-1">
                    Slug: <code className="bg-gray-100 px-1 rounded">{generatedSlug}</code>
                    {mode === 'group' && ' (duy nhất trong nhóm)'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về chuyến đi..."
                  rows={3}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="destination">Điểm đến</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder="Ví dụ: Đà Lạt, Lâm Đồng"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Danh mục</Label>
                <div className="relative mt-2">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    id="category"
                    value={formData.category || 'du-lich'}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="du-lich">Du lịch</option>
                    <option value="cong-viec">Công việc</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Thời gian
              </CardTitle>
              <CardDescription>Chọn thời gian bắt đầu và kết thúc chuyến đi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Tiền tệ
              </CardTitle>
              <CardDescription>Chọn đơn vị tiền tệ cho chuyến đi và chi phí dự kiến</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="costPerPersonPlanned">Chi phí dự kiến mỗi người</Label>
                  <Input
                    id="costPerPersonPlanned"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.costPerPersonPlanned}
                    onChange={(e) => handleInputChange('costPerPersonPlanned', e.target.value)}
                    placeholder="Ví dụ: 1000000"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Không bắt buộc, phục vụ thống kê dự kiến.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ảnh bìa</CardTitle>
              <CardDescription>Thêm ảnh bìa cho chuyến đi</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="coverUrl">URL ảnh bìa</Label>
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => handleInputChange('coverUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {mode === 'group' && group && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Thông tin nhóm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600"><strong>Nhóm:</strong> {group.name}</p>
                  {'memberCount' in group && (
                    <p className="text-sm text-gray-600"><strong>Thành viên:</strong> {(group as any).memberCount} người</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button type="submit" disabled={creating || !formData.name.trim()} className="w-full bg-blue-600 hover:bg-blue-700">
                  {creating ? 'Đang tạo...' : 'Tạo chuyến đi'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}


