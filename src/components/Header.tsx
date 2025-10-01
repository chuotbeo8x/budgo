'use client';

import Link from 'next/link';
// import Image from 'next/image'; // Removed to avoid image config issues
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { logout, signInWithGoogle } from '@/lib/auth';
import NotificationBell from './NotificationBell';
import PWAInstallButton from './PWAInstallButton';
import { 
  Globe, 
  Sun, 
  Moon, 
  User,
  Settings,
  Users,
  MapPin,
  Heart,
  MoreVertical
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('vi');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [siteName, setSiteName] = useState<string>('Budgo');

  // Ensure hydration is complete before rendering
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load branding settings
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          setLogoUrl(data.data.logoUrl || undefined);
          if (data.data.siteName) setSiteName(data.data.siteName);
        }
      } catch {}
    };
    load();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme switching logic
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
    // TODO: Implement language switching logic
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <header className="w-full border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop Header - Design System Compliant */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50 hidden lg:block shadow-sm">
      {/* Locked account banner */}
      {profile && (profile as any).disabled === true && (
        <div className="w-full bg-error-600 text-white text-sm">
          <div className="container mx-auto px-6 py-2 flex items-center justify-between max-w-7xl">
            <span>Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.</span>
          </div>
        </div>
      )}
      
      {/* Design System: Desktop header height = 64px (4rem) */}
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-6 w-auto" />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-lg tracking-tight">{siteName}</span>
          </Link>
        </div>

        {/* Desktop Navigation - Design System: gap-1.5rem (24px), min-h-44px for touch targets */}
        <nav className="hidden md:flex items-center gap-2">
          <Link 
            href="/groups/manage" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[44px] ${
              pathname.startsWith('/groups') 
                ? 'text-green-600 bg-green-50 shadow-sm' 
                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <Users className={`w-5 h-5 transition-transform ${
              pathname.startsWith('/groups') 
                ? 'scale-110' 
                : 'group-hover:scale-110'
            }`} />
            <span>Nhóm</span>
          </Link>
          <Link 
            href="/trips/manage" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group min-h-[44px] ${
              pathname.startsWith('/trips') 
                ? 'text-blue-600 bg-blue-50 shadow-sm' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className={`w-5 h-5 transition-transform ${
              pathname.startsWith('/trips') 
                ? 'scale-110' 
                : 'group-hover:scale-110'
            }`} />
            <span>Chuyến đi</span>
          </Link>
        </nav>

        {/* Right side - User actions - Design System: gap-0.75rem (12px) */}
        <div className="flex items-center gap-3">
          {loading && (
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          )}
          {!loading && user && (
            <>
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* PWA Install Button */}
              <PWAInstallButton 
                variant="ghost" 
                size="sm" 
                showText={false}
                className="hidden sm:flex"
              />
              
              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full">
                      <Avatar 
                        src={user.photoURL} 
                        alt="Avatar" 
                        size={32}
                        fallbackIcon={<User className="w-5 h-5 text-white" />}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {profile?.name || 'Bạn'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.name || 'Bạn'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/manage">
                        <Settings className="w-4 h-4" />
                        <span>Quản lý</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/welcome">
                        <Heart className="w-4 h-4" />
                        <span>Giới thiệu</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/profiles/me">
                        <User className="w-4 h-4" />
                        <span>Cài đặt cá nhân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Admin section */}
                    {profile && (profile as any).role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>
                          Quản trị
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={toggleTheme}>
                      {isDarkMode ? (
                        <>
                          <Sun className="w-4 h-4" />
                          <span>Chế độ sáng</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          <span>Chế độ tối</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleLanguage}>
                      <Globe className="w-4 h-4" />
                      <span>Chuyển ngôn ngữ</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={async () => {
                        await logout();
                        window.location.href = '/';
                      }}
                      className="text-error-600 hover:bg-error-50 focus:bg-error-50"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Profile Dropdown */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 rounded-full">
                      <Avatar 
                        src={user.photoURL} 
                        alt="Avatar" 
                        size={32}
                        fallbackIcon={<User className="w-5 h-5 text-white" />}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.name || 'Bạn'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* Navigation */}
                    <DropdownMenuItem asChild>
                      <Link href="/groups/manage">
                        <Users className="w-4 h-4" />
                        <span>Nhóm</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/trips/manage">
                        <MapPin className="w-4 h-4" />
                        <span>Chuyến đi</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/welcome">
                        <Heart className="w-4 h-4" />
                        <span>Giới thiệu</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Settings */}
                    <DropdownMenuItem asChild>
                      <Link href="/profiles/me">
                        <User className="w-4 h-4" />
                        <span>Cài đặt cá nhân</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        <span>Cài đặt</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* Admin section */}
                    {profile && (profile as any).role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>
                          Quản trị
                        </DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Settings className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={toggleTheme}>
                      {isDarkMode ? (
                        <>
                          <Sun className="w-4 h-4" />
                          <span>Chế độ sáng</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4" />
                          <span>Chế độ tối</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleLanguage}>
                      <Globe className="w-4 h-4" />
                      <span>Chuyển ngôn ngữ</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={async () => {
                        await logout();
                        window.location.href = '/';
                      }}
                      className="text-error-600 hover:bg-error-50 focus:bg-error-50"
                    >
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
          {!loading && !user && (
            <Button
              onClick={() => signInWithGoogle()}
              size="sm"
              className="text-sm"
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
      </header>

    </>
  );
}