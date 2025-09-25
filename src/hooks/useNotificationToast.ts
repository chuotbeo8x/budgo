'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { toast } from 'sonner';

export function useNotificationToast() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Listen for new notifications (without orderBy to avoid index requirement)
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false),
      limit(10) // Get more to sort in memory
    );

    let lastNotificationId: string | null = null;

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        // Sort notifications by createdAt in memory
        const notifications = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const aTime = (a as any).createdAt?.toDate ? (a as any).createdAt.toDate().getTime() : 0;
            const bTime = (b as any).createdAt?.toDate ? (b as any).createdAt.toDate().getTime() : 0;
            return bTime - aTime; // Descending order
          });

        // Check for new notifications
        const latestNotification = notifications[0];
        if (latestNotification && latestNotification.id !== lastNotificationId) {
          lastNotificationId = latestNotification.id;

          // Only show toast if it's a truly new notification (created in last 5 seconds)
          if ((latestNotification as any).createdAt && (latestNotification as any).createdAt.toDate && (latestNotification as any).createdAt.toDate().getTime() > (Date.now() - 5000)) {
            // Show toast notification
            const getToastIcon = (type: string) => {
              switch (type) {
                case 'group_request':
                  return '👥';
                case 'group_joined':
                  return '✅';
                case 'trip_created':
                  return '✈️';
                case 'expense_added':
                  return '💰';
                case 'settlement_ready':
                  return '💳';
                case 'admin_broadcast':
                  return '📢';
                default:
                  return '🔔';
              }
            };

            const getToastAction = (type: string) => {
              switch (type) {
                case 'group_request':
                  return {
                    label: 'Xem yêu cầu',
                        onClick: () => window.location.href = `/g/${(latestNotification as any).data.groupId}/requests`
                  };
                case 'trip_created':
                  return {
                    label: 'Xem chuyến đi',
                    onClick: () => window.location.href = `/g/${(latestNotification as any).data.groupId}/trips/${(latestNotification as any).data.tripId}`
                  };
                case 'expense_added':
                  return {
                    label: 'Xem chi phí',
                    onClick: () => window.location.href = `/g/${(latestNotification as any).data.groupId}/trips/${(latestNotification as any).data.tripId}/expenses`
                  };
                case 'admin_broadcast':
                  return {
                    label: 'Thông báo hệ thống',
                    onClick: () => {}
                  };
                default:
                  return {
                    label: 'Xem thông báo',
                    onClick: () => window.location.href = '/notifications'
                  };
              }
            };

                  toast.success((latestNotification as any).title, {
                    description: (latestNotification as any).message,
                    icon: getToastIcon((latestNotification as any).type),
                    action: getToastAction((latestNotification as any).type),
              duration: 5000,
            });
          }
        }
      },
      (error) => {
        console.error('Error listening to new notifications:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);
}