'use client';

import { useEffect, useState } from 'react';
import { useProfile } from '@/components/auth/ProfileProvider';
import { createNotification } from '@/lib/actions/notifications';
import { toast } from 'sonner';

export default function WelcomeNotification() {
  const { profile } = useProfile();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    const showWelcomeNotification = async () => {
      // Chỉ hiển thị cho user mới (profile vừa được tạo)
      if (!profile || hasShownWelcome) return;

      // Kiểm tra nếu user vừa được tạo (trong vòng 5 phút)
      const profileCreatedAt = new Date(profile.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - profileCreatedAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeDiff < fiveMinutes) {
        try {
          // Tạo thông báo chào mừng
          await createNotification({
            userId: profile.id,
            type: 'welcome',
            title: '🎉 Chào mừng đến với Budgo!',
            message: 'Cảm ơn bạn đã tham gia! Hãy khám phá các tính năng tuyệt vời của chúng tôi.',
            isRead: false,
          });

          // Hiển thị toast chào mừng
          toast.success('🎉 Chào mừng đến với Budgo!', {
            description: 'Hãy khám phá các tính năng tuyệt vời của chúng tôi.',
            duration: 5000,
          });

          setHasShownWelcome(true);
          
          // Mark that user has seen welcome page to prevent redirect loop
          if (typeof window !== 'undefined') {
            localStorage.setItem('budgo_welcome_seen_' + profile.id, 'true');
          }
        } catch (error) {
          console.error('Error creating welcome notification:', error);
        }
      }
    };

    showWelcomeNotification();
  }, [profile, hasShownWelcome]);

  return null; // Component không render gì, chỉ chạy logic
}

