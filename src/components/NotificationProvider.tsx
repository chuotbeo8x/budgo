'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUnreadNotificationsCount } from '@/lib/actions/notifications';
import { getTodaysBirthdays } from '@/lib/actions/users';
import NotificationPanel from './NotificationPanel';
import { useNotificationToast } from '@/hooks/useNotificationToast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);

  // Enable toast notifications for new notifications
  useNotificationToast();

  useEffect(() => {
    if (user) {
      loadData();
      
      // Set up real-time listener for notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        setUnreadCount(snapshot.size);
      }, (error) => {
        console.error('Error listening to notifications:', error);
        // Fallback to polling if real-time fails
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
      });

      return () => {
        unsubscribe();
      };
    } else {
      setUnreadCount(0);
      setBirthdayMembers([]);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Temporarily disable birthday feature to avoid server errors
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count || 0);
      setBirthdayMembers([]); // Set empty array for now
      
      // const [count, birthdays] = await Promise.all([
      //   getUnreadNotificationsCount(user.uid),
      //   getTodaysBirthdays(user.uid)
      // ]);
      // setUnreadCount(count || 0);
      // setBirthdayMembers(birthdays || []);
    } catch (error) {
      console.error('Error loading notification data:', error);
      setUnreadCount(0);
      setBirthdayMembers([]);
    }
  };

  useEffect(() => {
    const handleOpenPanel = (event: CustomEvent) => {
      setIsPanelOpen(true);
    };

    window.addEventListener('openNotificationPanel', handleOpenPanel as EventListener);
    return () => window.removeEventListener('openNotificationPanel', handleOpenPanel as EventListener);
  }, []);

  return (
    <>
      {children}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        unreadCount={unreadCount}
        birthdayMembers={birthdayMembers}
        userId={user?.uid}
      />
    </>
  );
}
