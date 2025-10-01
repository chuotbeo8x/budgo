'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Bell,
  Save,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      birthday: true,
      tripUpdates: true
    }
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement save logic
  };

  return (
    // Design System: Clean background, responsive spacing
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Cài đặt</h1>
            <p className="text-sm text-gray-600 mt-1">Quản lý cài đặt ứng dụng và tùy chọn cá nhân</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </Link>
        </div>

        {/* Settings Sections - Design System */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <CardTitle>Thông báo</CardTitle>
              </div>
              <CardDescription>Quản lý các loại thông báo bạn muốn nhận</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="email-notifications" className="cursor-pointer">Email thông báo</Label>
                    <p className="text-xs text-gray-500 mt-1">Nhận thông báo qua email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="birthday-notifications" className="cursor-pointer">Nhắc nhở sinh nhật</Label>
                    <p className="text-xs text-gray-500 mt-1">Nhắc nhở sinh nhật thành viên</p>
                  </div>
                  <Switch
                    id="birthday-notifications"
                    checked={settings.notifications.birthday}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, birthday: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <Label htmlFor="trip-updates" className="cursor-pointer">Cập nhật chuyến đi</Label>
                    <p className="text-xs text-gray-500 mt-1">Thông báo khi có thay đổi chuyến đi</p>
                  </div>
                  <Switch
                    id="trip-updates"
                    checked={settings.notifications.tripUpdates}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, tripUpdates: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Coming Soon - Design System */}
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tính năng đang phát triển</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Chúng tôi đang phát triển thêm nhiều tính năng cài đặt hữu ích
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 max-w-lg mx-auto">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Chủ đề tối/sáng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Đa ngôn ngữ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Quyền riêng tư nâng cao</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Xuất dữ liệu cá nhân</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                  <span>Backup tự động</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button - Design System */}
        <div className="mt-6 lg:mt-8 flex justify-end">
          <Button onClick={handleSave}>
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  );
}