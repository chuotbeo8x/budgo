'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getGroupBySlug, updateGroup, deleteGroup } from '@/lib/actions/groups';
import { Group } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Image,
  Save,
  Trash2,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { AlertMessage } from '@/components/ui/AlertMessage';

export default function GroupManagePage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    type: 'public' as 'public' | 'close' | 'secret',
  });

  useEffect(() => {
    if (slug) {
      loadGroup();
    }
  }, [slug]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const groupData = await getGroupBySlug(slug as string);
      setGroup(groupData);
      
      if (groupData) {
        setFormData({
          name: groupData.name,
          description: groupData.description || '',
          coverUrl: groupData.coverUrl || '',
          type: groupData.type,
        });
      }
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  // Check ownership after both group and user are loaded
  useEffect(() => {
    if (group && user) {
      const owner = user.uid === group.ownerId;
      setIsOwner(owner);
      console.log('Checking ownership:', { userId: user.uid, ownerId: group.ownerId, isOwner: owner });
    }
  }, [group, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !user) return;

    try {
      setSubmitting(true);
      const updateData = new FormData();
      updateData.append('groupId', group.id);
      updateData.append('name', formData.name);
      updateData.append('description', formData.description);
      updateData.append('coverUrl', formData.coverUrl);
      updateData.append('type', formData.type);
      updateData.append('userId', user.uid);

      await updateGroup(updateData);
      toast.success('Cập nhật nhóm thành công!');
      loadGroup(); // Reload data
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Có lỗi xảy ra khi cập nhật nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!group || !user) return;

    try {
      setSubmitting(true);
      const deleteData = new FormData();
      deleteData.append('groupId', group.id);
      deleteData.append('userId', user.uid);

      await deleteGroup(deleteData);
      toast.success('Xóa nhóm thành công!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Có lỗi xảy ra khi xóa nhóm');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy nhóm</h1>
              <p className="text-gray-600 mb-6">Nhóm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
              <Link href="/dashboard">
                <Button>Về trang chủ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner && group && user) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
              <p className="text-gray-600 mb-4">Chỉ chủ nhóm mới có thể quản lý nhóm này</p>
              <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                <p>User ID: {user.uid}</p>
                <p>Owner ID: {group.ownerId}</p>
                <p>Match: {user.uid === group.ownerId ? 'Yes' : 'No'}</p>
              </div>
              <Link href={`/g/${slug}`}>
                <Button>Quay lại trang nhóm</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-main">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/g/${group.slug}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Cài đặt nhóm</h1>
              <p className="text-gray-600 mt-1">{group.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Group Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Thông tin nhóm
              </CardTitle>
              <CardDescription>
                Cập nhật thông tin cơ bản và cài đặt của nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên nhóm *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Tên nhóm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Loại nhóm</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'public' | 'close' | 'secret' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Công khai</option>
                      <option value="close">Kín</option>
                      <option value="secret">Bí mật</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Mô tả về nhóm..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverUrl">URL ảnh bìa</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="coverUrl"
                      type="url"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    {submitting ? 'Đang cập nhật...' : 'Cập nhật nhóm'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => loadGroup()}>
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Vùng nguy hiểm
              </CardTitle>
              <CardDescription>
                Các hành động này không thể hoàn tác và sẽ ảnh hưởng đến toàn bộ nhóm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertMessage
                type="danger"
                title="Xóa nhóm vĩnh viễn"
                message={`Hành động này sẽ xóa vĩnh viễn nhóm "${group?.name}" và tất cả dữ liệu liên quan bao gồm: Tất cả thành viên và quyền hạn, Tất cả chuyến đi và chi phí, Tất cả lời mời và yêu cầu tham gia, Tất cả dữ liệu không thể khôi phục.`}
                icon={<Trash2 className="w-4 h-4" />}
                className="mb-4"
              />
              <DeleteConfirmDialog
                trigger={
                  <Button
                    variant="destructive"
                    disabled={submitting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {submitting ? 'Đang xóa...' : 'Xóa nhóm vĩnh viễn'}
                  </Button>
                }
                title="Xóa nhóm vĩnh viễn"
                description={`Bạn có chắc chắn muốn xóa nhóm "${group?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa nhóm"
                cancelText="Hủy"
                onConfirm={handleDelete}
                loadingText="Đang xóa..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}