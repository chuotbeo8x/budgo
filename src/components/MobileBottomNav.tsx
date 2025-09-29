'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { 
  Home, 
  Users, 
  MapPin, 
  User, 
  Bell,
  Plus,
  Settings,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { profile } = useProfile();

  // Don't show on certain pages
  const hideOnPages = ['/login', '/onboarding', '/welcome'];
  if (hideOnPages.some(page => pathname.startsWith(page))) {
    return null;
  }

  // Find which item is currently active
  const activeItem = [
    { href: '/', icon: Home, label: 'Trang chủ', active: pathname === '/' },
    { href: '/groups/manage', icon: Users, label: 'Nhóm', active: pathname.startsWith('/groups') },
    { href: '/trips/manage', icon: MapPin, label: 'Chuyến đi', active: pathname.startsWith('/trips') },
    { href: '/notifications', icon: Bell, label: 'Thông báo', active: pathname.startsWith('/notifications'), showBadge: true },
    { href: user ? `/profiles/${profile?.username || 'me'}` : '/login', icon: User, label: 'Cá nhân', active: pathname.startsWith('/profiles') || pathname.startsWith('/settings') }
  ].find(item => item.active);

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Trang chủ',
      active: pathname === '/'
    },
    {
      href: '/groups/manage',
      icon: Users,
      label: 'Nhóm',
      active: pathname.startsWith('/groups')
    },
    {
      href: '/trips/manage',
      icon: MapPin,
      label: 'Chuyến đi',
      active: pathname.startsWith('/trips')
    },
    {
      href: '/notifications',
      icon: Bell,
      label: 'Thông báo',
      active: pathname.startsWith('/notifications'),
      showBadge: false // Sẽ được set dynamic dựa trên thông báo thật
    },
    {
      href: user ? `/profiles/${profile?.username || 'me'}` : '/login',
      icon: User,
      label: 'Cá nhân',
      active: pathname.startsWith('/profiles') || pathname.startsWith('/settings')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white/95 backdrop-blur-md lg:hidden" style={{ boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)' }}>
      <div className="flex items-end justify-around px-1 py-1 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          const isTrips = item.href === '/trips/manage';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center p-2 rounded-full transition-all duration-200",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isTrips ? (
                  <div className="flex items-center justify-center w-16 h-16 bg-white border-2 border-white rounded-full absolute left-1/2 transform -translate-x-1/2" style={{ bottom: '-8px' }}>
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                ) : (
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-transform duration-200",
                      isActive && "scale-110"
                    )} 
                  />
                )}
                {item.showBadge && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
