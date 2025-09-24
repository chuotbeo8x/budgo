'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUnreadNotificationsCount } from '@/lib/actions/notifications';
import { getTodaysBirthdays } from '@/lib/actions/users';
import NotificationPanel from './NotificationPanel';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
      // Refresh every 30 seconds
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
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
      />
    </>
  );
}
