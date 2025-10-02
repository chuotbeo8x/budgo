'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function ThemeToggle({ 
  variant = 'ghost', 
  size = 'sm',
  className 
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme, isDarkModeEnabled } = useTheme();
  
  // Hide theme toggle if dark mode is disabled by admin
  if (!isDarkModeEnabled) {
    return null;
  }

  const handleThemeChange = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'Hệ thống';
    }
    return resolvedTheme === 'dark' ? 'Tối' : 'Sáng';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleThemeChange}
      className={cn(
        "transition-colors duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
      aria-label={`Chuyển sang chế độ ${theme === 'system' ? 'hệ thống' : theme === 'dark' ? 'sáng' : 'tối'}`}
      title={`Chế độ hiện tại: ${getLabel()}. Nhấn để chuyển đổi.`}
    >
      {getIcon()}
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
