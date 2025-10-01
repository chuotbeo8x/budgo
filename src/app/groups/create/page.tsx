'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createGroup } from '@/lib/actions/groups';
import { GroupType } from '@/lib/types';
import { generateGroupSlug } from '@/lib/utils/slug';

export default function CreateGroupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    type: 'public' as GroupType,
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const generateSlugFromName = (name: string) => {
    return generateGroupSlug(name);
  };

  const handleGroupNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    const slug = generateSlugFromName(value);
    setGeneratedSlug(slug || 'group-' + Date.now());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('coverUrl', formData.coverUrl);
      formDataObj.append('type', formData.type);
      formDataObj.append('slug', generatedSlug);
      formDataObj.append('userId', user.uid);

      await createGroup(formDataObj);
      
      toast.success('Tạo nhóm thành công!');
      router.push(`/g/${generatedSlug}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo nhóm mới
            </h1>
            <p className="text-gray-600">
              Tạo nhóm để quản lý các chuyến đi cùng bạn bè
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhóm</CardTitle>
              <CardDescription>
                Điền thông tin cơ bản về nhóm của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên nhóm *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleGroupNameChange(e.target.value)}
                    placeholder="Nhập tên nhóm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả về nhóm (tùy chọn)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverUrl">Ảnh bìa (URL)</Label>
                  <Input
                    id="coverUrl"
                    type="url"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Loại nhóm *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as GroupType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="public">Public - Ai cũng có thể tham gia</option>
                    <option value="close">Close - Cần xin phép để tham gia</option>
                    <option value="secret">Secret - Chỉ mời mới tham gia được</option>
                  </select>
                </div>

                {generatedSlug && (
                  <div className="space-y-2">
                    <Label>Slug tự động</Label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm font-mono text-gray-700">{generatedSlug}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Slug sẽ được tự động tạo từ tên nhóm và sử dụng trong URL (tối đa 100 ký tự)
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang tạo...</span>
                      </div>
                    ) : (
                      'Tạo nhóm'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
