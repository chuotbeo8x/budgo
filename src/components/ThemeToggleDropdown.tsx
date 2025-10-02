'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface ThemeToggleDropdownProps {
  className?: string;
}

export default function ThemeToggleDropdown({ className }: ThemeToggleDropdownProps) {
  const { theme, setTheme, resolvedTheme, isDarkModeEnabled } = useTheme();
  
  // Hide theme dropdown if dark mode is disabled by admin
  if (!isDarkModeEnabled) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { value: 'light', label: 'Sáng', icon: Sun },
    { value: 'dark', label: 'Tối', icon: Moon },
    { value: 'system', label: 'Hệ thống', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "transition-colors duration-200",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "flex items-center gap-2",
          className
        )}
        aria-label="Chọn chế độ hiển thị"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.label}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;
              
              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value as 'light' | 'dark' | 'system');
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm flex items-center gap-3",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "transition-colors duration-150",
                    isSelected && "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                  )}
                  role="menuitem"
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{themeOption.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
