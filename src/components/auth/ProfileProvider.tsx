'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { getUserById } from '@/lib/actions/users';
import { User } from '@/lib/types';

interface ProfileContextType {
  profile: User | null;
  profileLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  profileLoading: true,
});

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // Wait for auth to finish
      if (loading) {
        return;
      }

      // No user = no profile
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        console.log('ProfileProvider: Checking profile for user:', user.uid);
        
        // Check if user profile exists using API route
        const response = await fetch(`/api/check-profile?userId=${user.uid}`);
        const result = await response.json();
        
        if (result.success && result.hasProfile) {
          // User has profile
          console.log('ProfileProvider: Profile found, setting profile state');
          setProfile(result.profile);
          
          // Check if user is new (created within last 24 hours) and redirect to welcome
          const profileCreatedAt = new Date(result.profile.createdAt);
          const now = new Date();
          const timeDiff = now.getTime() - profileCreatedAt.getTime();
          const oneDay = 24 * 60 * 60 * 1000;
          const isNewUser = timeDiff < oneDay;
          
          // Check if user has already seen the welcome page
          const hasSeenWelcome = localStorage.getItem(`budgo_welcome_seen_${user.uid}`) === 'true';
          
          // Redirect to welcome page for new users (only once)
          // Only redirect if not already on the correct page and not on onboarding
          if (isNewUser && !hasSeenWelcome && pathname !== '/welcome' && pathname !== '/onboarding') {
            console.log('ProfileProvider: New user, redirecting to welcome page for first time');
            router.push('/welcome');
          }
          // Note: Removed automatic redirect to dashboard for existing users
          // This allows users to navigate freely between pages
        } else {
          // User needs to create profile
          console.log('ProfileProvider: No profile found, redirecting to onboarding');
          setProfile(null);
          
          // Only redirect if not already on onboarding page
          if (pathname !== '/onboarding') {
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setProfile(null);
        
        // On error, redirect to onboarding
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user, loading, router, pathname]);

  // Enforce onboarding: if logged in but no profile, force stay on /onboarding
  const mustOnboard = !!user && !profile && !profileLoading;

  useEffect(() => {
    if (mustOnboard && pathname !== '/onboarding') {
      router.replace('/onboarding');
    }
  }, [mustOnboard, pathname, router]);

  if (mustOnboard && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ProfileContext.Provider value={{ profile, profileLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};





