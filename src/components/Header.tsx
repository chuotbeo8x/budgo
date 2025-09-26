'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { useProfile } from '@/components/auth/ProfileProvider';
import { logout, signInWithGoogle } from '@/lib/auth';
import NotificationBell from './NotificationBell';
import { 
  Globe, 
  Sun, 
  Moon, 
  User,
  ChevronDown,
  Settings,
  Users,
  MapPin,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [language, setLanguage] = useState('vi');
  const [isHydrated, setIsHydrated] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [siteName, setSiteName] = useState<string>('Budgo');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      {/* Locked account banner */}
      {profile && (profile as any).disabled === true && (
        <div className="w-full bg-red-600 text-white text-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <span>Tài khoản của bạn đang bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.</span>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-6 w-auto" />
            ) : (
              <Image src="/vercel.svg" alt="Logo" width={24} height={24} />
            )}
            <span className="font-bold text-lg tracking-tight">{siteName}</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Link 
            href="/groups/manage" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
              pathname.startsWith('/groups') 
                ? 'text-blue-600 bg-blue-50 shadow-sm' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Users className={`w-4 h-4 transition-transform ${
              pathname.startsWith('/groups') 
                ? 'scale-110' 
                : 'group-hover:scale-110'
            }`} />
            <span>Nhóm</span>
          </Link>
          <Link 
            href="/trips/manage" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
              pathname.startsWith('/trips') 
                ? 'text-green-600 bg-green-50 shadow-sm' 
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <MapPin className={`w-4 h-4 transition-transform ${
              pathname.startsWith('/trips') 
                ? 'scale-110' 
                : 'group-hover:scale-110'
            }`} />
            <span>Chuyến đi</span>
          </Link>

        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Menu"
        >
          {showMobileMenu ? (
            <X className="w-5 h-5 text-gray-600" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Right side icons and profile */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-gray-500">Đang tải…</span>
          ) : user ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />
              
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Chuyển ngôn ngữ"
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {profile?.name || 'Bạn'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link
                      href="/profiles/me"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Cài đặt cá nhân
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Cài đặt
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      Đăng xuất
                    </button>
                    {profile && (profile as any).role === 'admin' && (
                      <>
                        <hr className="my-1" />
                        <div className="px-4 py-1 text-[11px] uppercase tracking-wide text-gray-400">Khu vực quản trị</div>
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Đăng nhập với Google
            </button>
          )}
        </div>

        {/* Mobile Profile Button */}
        <div className="md:hidden flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-gray-500">Đang tải…</span>
          ) : user ? (
            <>
              <NotificationBell />
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt="Avatar" 
                    width={24} 
                    height={24} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t bg-white" ref={mobileMenuRef}>
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/groups/manage" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith('/groups') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <Users className="w-5 h-5" />
                <span>Nhóm</span>
              </Link>
              <Link 
                href="/trips/manage" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname.startsWith('/trips') 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                <MapPin className="w-5 h-5" />
                <span>Chuyến đi</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Profile Menu */}
      {showProfileMenu && user && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt="Avatar" 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{user.displayName || 'Người dùng'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowProfileMenu(false)}
              >
                <User className="w-4 h-4" />
                Hồ sơ cá nhân
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
              >
                <Settings className="w-4 h-4" />
                Đăng xuất
              </button>
              
              {profile && (profile as any).role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


