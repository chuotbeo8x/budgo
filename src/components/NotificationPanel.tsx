'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Cake, Heart, Gift, Users, Plane, DollarSign, CheckCircle, UserPlus, UserMinus, Edit, Trash2, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getUserNotifications, markNotificationAsRead, deleteNotification } from '@/lib/actions/notifications';
import { Notification } from '@/lib/types';
import { formatDateTime } from '@/lib/utils/date';
import Link from 'next/link';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  birthdayMembers: any[];
  userId?: string;
}

export default function NotificationPanel({ 
  isOpen, 
  onClose, 
  unreadCount, 
  birthdayMembers,
  userId
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Load notifications when panel opens
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    if (!userId) {
      console.warn('NotificationPanel: No userId provided');
      return;
    }
    
    try {
      console.log('NotificationPanel: Loading notifications for userId:', userId);
      setLoadingNotifications(true);
      const notificationsData = await getUserNotifications(userId, 10); // Load last 10 notifications
      console.log('NotificationPanel: Loaded notifications:', notificationsData.length);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('NotificationPanel: Error loading notifications:', error);
      // Set empty array to prevent UI crashes
      setNotifications([]);
      // Only show toast for non-critical errors
      if (error instanceof Error && !error.message.includes('Database chưa được khởi tạo')) {
        toast.error('Có lỗi xảy ra khi tải thông báo');
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await markNotificationAsRead(notificationId, userId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Có lỗi xảy ra khi đánh dấu thông báo');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!userId) return;

    try {
      await deleteNotification(notificationId, userId);
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
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'group_joined':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'group_left':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'trip_created':
      case 'trip_updated':
      case 'trip_deleted':
        return <Plane className="w-4 h-4 text-purple-500" />;
      case 'expense_added':
      case 'expense_updated':
      case 'expense_deleted':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case 'settlement_ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'admin_broadcast':
        return <Megaphone className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case 'group_request':
        return (
          <Link href={`/g/${notification.data.groupId}/requests`}>
            <Button size="sm" variant="outline">Xem yêu cầu</Button>
          </Link>
        );
      case 'trip_created':
      case 'trip_updated':
        return (
          <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}`}>
            <Button size="sm" variant="outline">Xem chuyến đi</Button>
          </Link>
        );
      case 'expense_added':
      case 'expense_updated':
        return (
          <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}/expenses`}>
            <Button size="sm" variant="outline">Xem chi phí</Button>
          </Link>
        );
      case 'settlement_ready':
        return (
          <Link href={`/g/${notification.data.groupId}/trips/${notification.data.tripId}/settlement`}>
            <Button size="sm" variant="outline">Xem thanh toán</Button>
          </Link>
        );
      case 'admin_broadcast':
        return (
          <Button size="sm" variant="outline" disabled>
            Thông báo hệ thống
          </Button>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300); // Match animation duration
  };

  const sendBirthdayWish = (memberId: string, memberName: string) => {
    toast.success(`Đã gửi lời chúc mừng sinh nhật đến ${memberName}! 🎉`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`} />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isAnimating ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full" ref={panelRef}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Birthday Notifications */}
            {birthdayMembers.length > 0 && (
              <div className="space-y-3 animate-in slide-in-from-bottom fade-in">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Cake className="w-4 h-4 text-pink-500" />
                  Sinh nhật hôm nay
                </div>
                
                {birthdayMembers.map((member, index) => (
                  <Card 
                    key={member.id} 
                    className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 animate-in slide-in-from-bottom fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {member.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                          {member.groupName && (
                            <p className="text-xs text-gray-500 truncate">
                              {member.groupName}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendBirthdayWish(member.id, member.name)}
                            className="h-8 w-8 p-0 hover:bg-pink-100"
                            title="Gửi lời chúc"
                          >
                            <Heart className="w-3 h-3 text-pink-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendBirthdayWish(member.id, member.name)}
                            className="h-8 w-8 p-0 hover:bg-pink-100"
                            title="Gửi quà"
                          >
                            <Gift className="w-3 h-3 text-purple-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Regular Notifications */}
            <div className="space-y-3 animate-in slide-in-from-bottom fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bell className="w-4 h-4 text-blue-500" />
                  Thông báo gần đây
                </div>
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
              
              {loadingNotifications ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Không có thông báo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        notification.isRead 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-900' : 'text-blue-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              notification.isRead ? 'text-gray-600' : 'text-blue-700'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(notification.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                                title="Đánh dấu đã đọc"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="h-6 w-6 p-0 hover:bg-red-100"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        {getNotificationAction(notification) && (
                          <div className="mt-2">
                            {getNotificationAction(notification)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length > 5 && (
                    <div className="text-center pt-2">
                      <Link href="/notifications">
                        <Button variant="outline" size="sm">
                          Xem thêm {notifications.length - 5} thông báo
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
