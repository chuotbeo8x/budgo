'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { updateUserProfile } from '@/lib/actions/users';
import { toast } from 'sonner';
import LoginPrompt from '@/components/auth/LoginPrompt';

export default function ProfilesPage() {
  const { user, loading } = useAuth();
  const { profile, profileLoading } = useProfile();
  const [formData, setFormData] = useState({ 
    name: '', 
    birthday: '', 
    phone: '', 
    bio: '', 
    location: '',
    currency: 'VND'
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    birthday?: string; 
    phone?: string; 
    bio?: string; 
    location?: string;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to safely convert birthday to date string
  const getBirthdayValue = (birthday: any): string => {
    if (!birthday) return '';
    
    try {
      if (birthday instanceof Date) {
        return birthday.toISOString().split('T')[0];
      } else {
        const date = new Date(birthday);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.warn('Invalid birthday value:', birthday);
    }
    
    return '';
  };

  useEffect(() => {
    if (profile) {
      const birthdayValue = getBirthdayValue(profile.birthday);
      
      setFormData({ 
        name: profile.name || '', 
        birthday: birthdayValue,
        phone: (profile as any)?.phone || '',
        bio: (profile as any)?.bio || '',
        location: (profile as any)?.location || '',
        currency: (profile as any)?.currency || 'VND'
      });
      setHasChanges(false);
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const birthdayValue = getBirthdayValue(profile.birthday);
      
      const hasNameChanged = formData.name !== (profile.name || '');
      const hasBirthdayChanged = formData.birthday !== birthdayValue;
      const hasPhoneChanged = formData.phone !== ((profile as any)?.phone || '');
      const hasBioChanged = formData.bio !== ((profile as any)?.bio || '');
      const hasLocationChanged = formData.location !== ((profile as any)?.location || '');
      const hasCurrencyChanged = formData.currency !== ((profile as any)?.currency || 'VND');
      
      setHasChanges(hasNameChanged || hasBirthdayChanged || hasPhoneChanged || hasBioChanged || hasLocationChanged || hasCurrencyChanged);
    }
  }, [formData, profile]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { 
      name?: string; 
      birthday?: string; 
      phone?: string; 
      bio?: string; 
      location?: string;
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên hiển thị không được để trống';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên hiển thị phải có ít nhất 2 ký tự';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Tên hiển thị không được quá 50 ký tự';
    }

    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthdayDate.getFullYear();
      
      if (isNaN(birthdayDate.getTime())) {
        newErrors.birthday = 'Ngày sinh không hợp lệ';
      } else if (birthdayDate > today) {
        newErrors.birthday = 'Ngày sinh không thể là ngày tương lai';
      } else if (age > 120) {
        newErrors.birthday = 'Tuổi không hợp lệ';
      }
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Giới thiệu không được quá 500 ký tự';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Địa điểm không được quá 100 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.birthday, formData.phone, formData.bio, formData.location]);

  // Memoized computed values
  const isFormValid = useMemo(() => {
    const nameValid = formData.name.trim().length >= 2 && formData.name.trim().length <= 50;
    let birthdayValid = true;
    let phoneValid = true;
    let bioValid = true;
    let locationValid = true;
    
    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthdayDate.getFullYear();
      birthdayValid = !isNaN(birthdayDate.getTime()) && birthdayDate <= today && age <= 120;
    }

    if (formData.phone) {
      phoneValid = /^[0-9+\-\s()]+$/.test(formData.phone);
    }

    if (formData.bio) {
      bioValid = formData.bio.length <= 500;
    }

    if (formData.location) {
      locationValid = formData.location.length <= 100;
    }
    
    return nameValid && birthdayValid && phoneValid && bioValid && locationValid;
  }, [formData.name, formData.birthday, formData.phone, formData.bio, formData.location]);

  const canSave = useMemo(() => {
    return hasChanges && isFormValid && !saving;
  }, [hasChanges, isFormValid, saving]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('googleUid', user?.uid || '');
      fd.append('name', formData.name.trim());
      if (formData.birthday) {
        fd.append('birthday', formData.birthday);
      }
      if (formData.phone) {
        fd.append('phone', formData.phone.trim());
      }
      if (formData.bio) {
        fd.append('bio', formData.bio.trim());
      }
      if (formData.location) {
        fd.append('location', formData.location.trim());
      }
      fd.append('currency', formData.currency);
      await updateUserProfile(fd);
      toast.success('Đã lưu thông tin cá nhân');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setSaving(false);
    }
  }, [formData.name, user?.uid, validateForm]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
              <User className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-lg text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Vui lòng đăng nhập"
        description="Bạn cần đăng nhập để xem trang cá nhân"
        icon={<User className="w-8 h-8 text-blue-600" />}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản của bạn</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Unified Profile Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" 
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">Cài đặt cá nhân</CardTitle>
                  <p className="text-gray-600 mt-1">Quản lý thông tin và cài đặt tài khoản của bạn</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Tên hiển thị *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nhập tên hiển thị"
                      className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.name && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Birthday Field */}
                  <div className="space-y-2">
                    <Label htmlFor="birthday" className="text-sm font-medium text-gray-700">Ngày sinh</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      className={errors.birthday ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.birthday && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.birthday}
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Số điện thoại</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.phone && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  {/* Location Field */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Địa điểm</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Thành phố, quốc gia"
                      className={errors.location ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.location && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.location}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio Field */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Giới thiệu bản thân</Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Giới thiệu về bản thân..."
                    className={`w-full px-3 py-2 border rounded-md resize-none ${errors.bio ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    {errors.bio && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {errors.bio}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 ml-auto">{formData.bio.length}/500</span>
                  </div>
                </div>
              </div>

              {/* Read-only Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin từ Google</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      readOnly
                      className="bg-gray-50 border-gray-300 text-gray-600"
                    />
                    <p className="text-xs text-gray-500">Từ tài khoản Google</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">Tên người dùng</Label>
                    <Input
                      id="username"
                      value={(profile as any)?.username || ''}
                      disabled
                      className="bg-gray-50 border-gray-300 text-gray-600"
                    />
                    <p className="text-xs text-gray-500">Không thể thay đổi</p>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tùy chọn</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Đơn vị tiền tệ mặc định</Label>
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                    >
                      <option value="VND">VND (Việt Nam Đồng)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Privacy Settings - deferred per spec */}

          {/* Save Button */}
          <div className="flex justify-between items-center mt-8">
            {hasChanges && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="w-4 h-4" />
                Bạn có thay đổi chưa được lưu
              </div>
            )}
            <div className="flex gap-3 ml-auto">
              {hasChanges && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (profile) {
                      const birthdayValue = getBirthdayValue(profile.birthday);
                      
                      setFormData({ 
                        name: profile.name || '', 
                        birthday: birthdayValue,
                        phone: (profile as any)?.phone || '',
                        bio: (profile as any)?.bio || '',
                        location: (profile as any)?.location || '',
                        currency: (profile as any)?.currency || 'VND'
                      });
                      setHasChanges(false);
                      setErrors({});
                    }
                  }}
                  disabled={saving}
                >
                  Hủy
                </Button>
              )}
              <Button 
                onClick={handleSave}
                disabled={!canSave}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
