'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUnreadNotificationsCount } from '@/lib/actions/notifications';
import { getTodaysBirthdays } from '@/lib/actions/users';
import { Bell } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [birthdayMembers, setBirthdayMembers] = useState<any[]>([]);

  // Ensure hydration is complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user) {
      loadBirthdays();
      
      // Set up real-time listener for unread notifications count
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        setUnreadCount(snapshot.size);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to notifications:', error);
        // Fallback to polling if real-time fails
        loadUnreadCount();
        const interval = setInterval(() => {
          loadUnreadCount();
          loadBirthdays();
        }, 30000);
        return () => clearInterval(interval);
      });

      return () => {
        unsubscribe();
      };
    } else {
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);


  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBirthdays = async () => {
    if (!user) return;
    
    try {
      // Temporarily disable birthday feature to avoid server errors
      // const birthdays = await getTodaysBirthdays(user.uid);
      // setBirthdayMembers(birthdays || []);
      setBirthdayMembers([]); // Set empty array for now
    } catch (error) {
      console.error('Error loading birthdays:', error);
      setBirthdayMembers([]); // Set empty array on error
    }
  };


  if (!isHydrated) {
    return (
      <div className="p-2 rounded-full">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={() => {
        // Dispatch custom event to open notification panel
        window.dispatchEvent(new CustomEvent('openNotificationPanel', {
          detail: { unreadCount, birthdayMembers }
        }));
      }}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
    >
      <Bell className="w-6 h-6 text-gray-600" />
      
      {!loading && (unreadCount > 0 || birthdayMembers.length > 0) && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount + birthdayMembers.length > 99 ? '99+' : unreadCount + birthdayMembers.length}
        </span>
      )}
    </button>
  );
}
