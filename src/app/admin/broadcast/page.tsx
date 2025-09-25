'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-orange-600" />
              Gửi thông báo hệ thống
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gửi thông báo quan trọng đến tất cả thành viên trong hệ thống</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Quay lại</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Broadcast Form */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Tạo thông báo mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Tiêu đề *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nhập tiêu đề thông báo..."
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{form.title.length}/100 ký tự</p>
                </div>

                <div>
                  <Label htmlFor="message">Nội dung *</Label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Nhập nội dung thông báo..."
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{form.message.length}/500 ký tự</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 text-yellow-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Lưu ý quan trọng:</p>
                      <ul className="mt-1 space-y-1 text-xs">
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

          {/* Broadcast History */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Lịch sử gửi thông báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có thông báo nào được gửi</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.recipientCount} người nhận
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.sentAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
