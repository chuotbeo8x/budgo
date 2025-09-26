'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createUserProfile, getUserById } from '@/lib/actions/users';
import { CreateAccountSchema } from '@/lib/schemas';
import { generateUsernameSlug } from '@/lib/utils/slug';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Initialize formData with Google data if available
  const getInitialFormData = () => {
    if (user) {
      const googleUsername = user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : '';
      return {
        name: user.displayName || '',
        username: googleUsername,
        avatarUrl: user.photoURL || '',
        birthday: '',
      };
    }
    return {
      name: '',
      username: '',
      avatarUrl: '',
      birthday: '',
    };
  };
  
  const [formData, setFormData] = useState(getInitialFormData());
  const [submitting, setSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check if user already has profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user || loading) return;
      
      try {
        const existingProfile = await getUserById(user.uid);
        if (existingProfile) {
          // User already has profile, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking existing profile:', error);
      } finally {
        setCheckingProfile(false);
      }
    };

    checkExistingProfile();
  }, [user, loading, router]);

  const generateSlugFromUsername = (username: string) => {
    return generateUsernameSlug(username);
  };

  const handleUsernameChange = (value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    setUsernameError('');
    
    // Validate username format
    try {
      const slug = generateSlugFromUsername(value);
      if (value && slug !== value.toLowerCase()) {
        setUsernameError('Username sẽ được chuyển thành: ' + slug);
      }
    } catch (error) {
      setUsernameError('Username không hợp lệ');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setSubmitting(true);
      
      // Generate final username slug
      const finalUsername = generateSlugFromUsername(formData.username);
      
      const data = {
        name: formData.name,
        username: finalUsername,
        avatarUrl: formData.avatarUrl || undefined,
        birthday: formData.birthday || undefined,
      };

      // Validate input
      const validatedData = CreateAccountSchema.parse(data);

      const formDataObj = new FormData();
      formDataObj.append('name', validatedData.name);
      formDataObj.append('username', validatedData.username);
      formDataObj.append('avatarUrl', validatedData.avatarUrl || '');
      formDataObj.append('birthday', validatedData.birthday?.toISOString() || '');
      formDataObj.append('googleUid', user.uid);
      formDataObj.append('email', user.email || '');

      const response = await fetch('/api/create-profile', {
        method: 'POST',
        body: formDataObj,
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create profile');
      }
      
      toast.success('Tạo profile thành công!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      if (error instanceof Error) {
        if (error.message.includes('username')) {
          setUsernameError(error.message);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Có lỗi xảy ra khi tạo profile');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chào mừng đến với Budgo!
            </h1>
            <p className="text-gray-600">
              Hãy tạo profile để bắt đầu sử dụng ứng dụng
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Điền thông tin cơ bản để hoàn tất đăng ký
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên hiển thị *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên hiển thị"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="username-cua-ban"
                    required
                  />
                  {usernameError && (
                    <p className={`text-sm ${usernameError.includes('sẽ được chuyển') ? 'text-blue-600' : 'text-red-600'}`}>
                      {usernameError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Username đã được lấy từ email Google của bạn. Bạn có thể sửa đổi nếu muốn (chỉ chữ thường, số và dấu gạch ngang)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Ảnh đại diện (URL)</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-gray-500">
                    Để trống để sử dụng ảnh từ Google
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">Ngày sinh (tùy chọn)</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">
                    Để trống nếu không muốn chia sẻ ngày sinh
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={submitting || !!usernameError}
                    className="flex-1"
                  >
                    {submitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang tạo...</span>
                      </div>
                    ) : (
                      'Hoàn tất đăng ký'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Bạn có thể thay đổi thông tin này sau trong phần cài đặt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}