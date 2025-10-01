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
import { Bell } from 'lucide-react';
import Link from 'next/link';
import LoginPrompt from '@/components/auth/LoginPrompt';

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
      case 'group_request':
        return '📝';
      case 'group_joined':
        return '👥';
      case 'group_left':
        return '👋';
      case 'trip_created':
        return '✈️';
      case 'trip_updated':
        return '✏️';
      case 'trip_deleted':
        return '🗑️';
      case 'expense_added':
        return '💰';
      case 'expense_updated':
        return '✏️';
      case 'expense_deleted':
        return '🗑️';
      case 'settlement_ready':
        return '✅';
      case 'admin_broadcast':
        return '📢';
      case 'trip_closed':
        return '🔒';
      default:
        return '🔔';
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'group_request':
        return (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <Link href={`/g/${notification.data.groupId}/requests`}>
              <Button size="sm" className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto">Xem yêu cầu</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
              className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
            >
              Xóa
            </Button>
          </div>
        );
      case 'trip_created':
      case 'trip_updated':
        return (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}`}>
              <Button size="sm" className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto">Xem chuyến đi</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
              className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
            >
              Xóa
            </Button>
          </div>
        );
      case 'expense_added':
      case 'expense_updated':
        return (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}/expenses`}>
              <Button size="sm" className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto">Xem chi phí</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
              className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
            >
              Xóa
            </Button>
          </div>
        );
      case 'settlement_ready':
        return (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}/settlement`}>
              <Button size="sm" className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto">Xem thanh toán</Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
              className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
            >
              Xóa
            </Button>
          </div>
        );
      case 'admin_broadcast':
        return (
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
            <Button size="sm" variant="outline" disabled className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto">
              Thông báo hệ thống
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteNotification(notification.id)}
              className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
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
            className="h-7 sm:h-8 text-xs sm:text-sm w-full sm:w-auto"
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Cần đăng nhập"
        description="Bạn cần đăng nhập để xem thông báo"
        icon={<Bell className="w-8 h-8 text-blue-600" />}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                Thông báo
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {unreadCount > 0 && `${unreadCount} thông báo chưa đọc`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
              <Link href="/dashboard">
                <Button variant="outline" className="h-8 sm:h-9 text-xs sm:text-sm">Về trang chủ</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-3 sm:pt-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                Tất cả ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className="h-8 sm:h-9 text-xs sm:text-sm"
              >
                Chưa đọc ({unreadCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Danh sách thông báo</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {filter === 'all' 
                ? `Hiển thị ${filteredNotifications.length} thông báo`
                : `Hiển thị ${filteredNotifications.length} thông báo chưa đọc`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm sm:text-base text-gray-500">
                  {filter === 'all' ? 'Chưa có thông báo nào' : 'Không có thông báo chưa đọc'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border ${
                      notification.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="text-lg sm:text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
                        <div className="flex-1">
                          <h3 className={`text-sm sm:text-base font-medium ${
                            notification.isRead ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-xs sm:text-sm mt-1 ${
                            notification.isRead ? 'text-gray-600' : 'text-blue-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                            {formatDateTime(notification.createdAt)}
                            {notification.isRead && notification.readAt && (
                              <span> • Đã đọc {formatDateTime(notification.readAt)}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 sm:ml-4">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-7 sm:h-8 text-xs sm:text-sm"
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          <div className="w-full sm:w-auto">
                            {getNotificationAction(notification)}
                          </div>
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
