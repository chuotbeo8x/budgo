'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (loading) {
        return; // Wait for auth to finish
      }

      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        console.log('ProfileProvider: Checking profile for user:', user.uid);
        const userProfile = await getUserById(user.uid);
        console.log('ProfileProvider: Profile result:', userProfile ? 'Found' : 'Not found');
        
        if (!userProfile) {
          // User doesn't have a profile
          console.log('ProfileProvider: No profile found, redirecting to onboarding');
          setProfile(null);
          // Only redirect to onboarding if not already there
          if (window.location.pathname !== '/onboarding') {
            // Small delay to ensure smooth transition
            setTimeout(() => {
              console.log('ProfileProvider: Redirecting to /onboarding');
              router.push('/onboarding');
            }, 100);
          }
          return;
        }
        
        console.log('ProfileProvider: Profile found, setting profile state');
        setProfile(userProfile);
      } catch (error) {
        console.error('Error checking user profile:', error);
        setProfile(null);
        // On error, redirect to onboarding to be safe (only if not already there)
        if (window.location.pathname !== '/onboarding') {
          setTimeout(() => {
            router.push('/onboarding');
          }, 100);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user, loading, router]);

  return (
    <ProfileContext.Provider value={{ profile, profileLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};





