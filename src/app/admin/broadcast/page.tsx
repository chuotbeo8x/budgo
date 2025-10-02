'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Megaphone, Send, Users, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface BroadcastHistory {
  id: string;
  title: string;
  message: string;
  sentAt: Date;
  sentBy: string;
  recipientCount: number;
}

export default function AdminBroadcastPage() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
  });

  useEffect(() => {
    if (user && (profile as any)?.role === 'admin') {
      loadBroadcastHistory();
    }
  }, [user, profile]);

  const loadBroadcastHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/admin/broadcast/history', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.success) {
          setHistory(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading broadcast history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(`Đã gửi thông báo đến ${data.recipientCount} thành viên!`);
        setForm({ title: '', message: '' });
        loadBroadcastHistory(); // Reload history
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi gửi thông báo');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (profile as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Không có quyền truy cập</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Bạn cần quyền quản trị để truy cập khu vực này.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    // Design System: Clean background, responsive spacing
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        {/* Header Section - Design System Typography */}
        <header className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-2">
                <Megaphone className="w-6 h-6 text-warning-600" />
                Gửi thông báo hệ thống
              </h1>
              <p className="text-sm text-gray-600">
                Gửi thông báo quan trọng đến tất cả thành viên trong hệ thống
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Quay lại
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content - Design System: Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Send Broadcast Form - Design System: Card with proper shadows */}
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Send className="w-5 h-5 text-primary-600" />
                Tạo thông báo mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Tạo thông báo mới">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Tiêu đề *
                  </Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nhập tiêu đề thông báo..."
                    maxLength={100}
                    required
                    aria-describedby="title-help"
                    className="w-full"
                  />
                  <p id="title-help" className="text-xs text-gray-500">
                    {form.title.length}/100 ký tự
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Nội dung *
                  </Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Nhập nội dung thông báo..."
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors duration-200"
                    maxLength={500}
                    required
                    aria-describedby="message-help"
                  />
                  <p id="message-help" className="text-xs text-gray-500">
                    {form.message.length}/500 ký tự
                  </p>
                </div>

                {/* Warning Notice - Design System: Alert styling */}
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4" role="alert" aria-label="Lưu ý quan trọng">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0">⚠️</div>
                    <div className="text-sm text-warning-800">
                      <p className="font-medium mb-2">Lưu ý quan trọng:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Thông báo sẽ được gửi đến TẤT CẢ thành viên</li>
                        <li>• Không thể hoàn tác sau khi gửi</li>
                        <li>• Hãy kiểm tra kỹ nội dung trước khi gửi</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.title.trim() || !form.message.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Gửi thông báo</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Broadcast History - Design System: Card with proper shadows */}
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="w-5 h-5 text-gray-600" />
                Lịch sử gửi thông báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-4" role="status" aria-label="Đang tải lịch sử">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12" role="status" aria-label="Không có dữ liệu">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm text-gray-500">Chưa có thông báo nào được gửi</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto" role="list" aria-label="Lịch sử thông báo">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200" role="listitem">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{item.recipientCount} người nhận</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(item.sentAt).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </div>
  );
}
