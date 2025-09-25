'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600">Quản lý cài đặt ứng dụng và tùy chọn cá nhân</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email thông báo</Label>
                    <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
                  </div>
                  <input
                    type="checkbox"
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, email: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="birthday-notifications">Nhắc nhở sinh nhật</Label>
                    <p className="text-xs text-gray-500">Nhắc nhở sinh nhật thành viên</p>
                  </div>
                  <input
                    type="checkbox"
                    id="birthday-notifications"
                    checked={settings.notifications.birthday}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, birthday: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="trip-updates">Cập nhật chuyến đi</Label>
                    <p className="text-xs text-gray-500">Thông báo khi có thay đổi chuyến đi</p>
                  </div>
                  <input
                    type="checkbox"
                    id="trip-updates"
                    checked={settings.notifications.tripUpdates}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, tripUpdates: e.target.checked }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Coming Soon */}
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Settings className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng đang phát triển</h3>
                <p className="text-gray-600 mb-4">
                  Chúng tôi đang phát triển thêm nhiều tính năng cài đặt hữu ích:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Chủ đề tối/sáng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Đa ngôn ngữ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Quyền riêng tư nâng cao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Push notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Xuất dữ liệu cá nhân</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Backup tự động</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  );
}