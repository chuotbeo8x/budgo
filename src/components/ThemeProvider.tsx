'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  isDarkModeEnabled: boolean; // Admin setting: whether dark mode feature is enabled
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(true); // Default to enabled

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      setTheme(stored);
    }
    
    // Load admin dark mode setting
    const loadAdminSetting = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data?.success && data.data) {
          setIsDarkModeEnabled(!!data.data.darkModeEnabled);
        }
      } catch (error) {
        console.warn('Failed to load admin dark mode setting:', error);
      }
    };
    loadAdminSetting();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Determine resolved theme
    let resolved: 'light' | 'dark' = 'light';
    
    // If dark mode is disabled by admin, force light mode
    if (!isDarkModeEnabled) {
      resolved = 'light';
    } else if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      resolved = systemTheme;
    } else {
      resolved = theme;
    }

    // Apply theme
    root.classList.add(resolved);
    setResolvedTheme(resolved);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted, isDarkModeEnabled]);

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== 'system' || !isDarkModeEnabled) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isDarkModeEnabled]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isDarkModeEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

