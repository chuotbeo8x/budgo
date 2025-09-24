'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '@/lib/actions/notifications';
import { Notification } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoadingNotifications(true);
      const notificationsData = await getUserNotifications(user.uid);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Có lỗi xảy ra khi tải thông báo');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await markNotificationAsRead(notificationId, user.uid);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      toast.success('Đã đánh dấu thông báo đã đọc');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Có lỗi xảy ra khi đánh dấu thông báo');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      toast.success('Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Có lỗi xảy ra khi đánh dấu thông báo');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      await deleteNotification(notificationId, user.uid);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      toast.success('Đã xóa thông báo');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Có lỗi xảy ra khi xóa thông báo');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'group_invite':
        return '👥';
      case 'group_request':
        return '📝';
      case 'trip_invite':
        return '✈️';
      case 'expense_added':
        return '💰';
      case 'trip_closed':
        return '🔒';
      default:
        return '🔔';
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'group_invite':
        return (
          <div className="flex space-x-2">
            <Link href={`/notifications/invite/${notification.data.inviteId}`}>
              <Button size="sm">Xem lời mời</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
            >
              Xóa
            </Button>
          </div>
        );
      case 'group_request':
        return (
          <div className="flex space-x-2">
            <Link href={`/g/${notification.data.groupId}/requests`}>
              <Button size="sm">Xem yêu cầu</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
            >
              Xóa
            </Button>
          </div>
        );
      default:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteNotification(notification.id)}
          >
            Xóa
          </Button>
        );
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading || loadingNotifications) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để xem thông báo
          </p>
          <Link href="/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Thông báo
              </h1>
              <p className="text-gray-600">
                {unreadCount > 0 && `${unreadCount} thông báo chưa đọc`}
              </p>
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Link href="/dashboard">
                <Button variant="outline">Về trang chủ</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex space-x-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Tất cả ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
              >
                Chưa đọc ({unreadCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thông báo</CardTitle>
            <CardDescription>
              {filter === 'all' 
                ? `Hiển thị ${filteredNotifications.length} thông báo`
                : `Hiển thị ${filteredNotifications.length} thông báo chưa đọc`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {filter === 'all' ? 'Chưa có thông báo nào' : 'Không có thông báo chưa đọc'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            notification.isRead ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.isRead ? 'text-gray-600' : 'text-blue-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDateTime(notification.createdAt)}
                            {notification.isRead && notification.readAt && (
                              <span> • Đã đọc {formatDateTime(notification.readAt)}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          {getNotificationAction(notification)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
