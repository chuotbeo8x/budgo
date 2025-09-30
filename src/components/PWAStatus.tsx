'use client';

import { usePWA } from '@/hooks/usePWA';
import { Download, Smartphone, Monitor, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PWAStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function PWAStatus({ showDetails = false, className = '' }: PWAStatusProps) {
  const { 
    isInstalled, 
    isStandalone, 
    canInstall, 
    isOnline, 
    isUpdateAvailable, 
    installApp, 
    updateApp 
  } = usePWA();

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isInstalled ? (
          <div className="flex items-center gap-1 text-green-600">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs">Đã cài đặt</span>
          </div>
        ) : canInstall ? (
          <div className="flex items-center gap-1 text-blue-600">
            <Download className="w-4 h-4" />
            <span className="text-xs">Có thể cài đặt</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-500">
            <Monitor className="w-4 h-4" />
            <span className="text-xs">Trình duyệt</span>
          </div>
        )}
        
        {!isOnline && (
          <div className="flex items-center gap-1 text-orange-600">
            <WifiOff className="w-4 h-4" />
            <span className="text-xs">Offline</span>
          </div>
        )}
        
        {isUpdateAvailable && (
          <Button
            onClick={updateApp}
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Cập nhật
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Trạng thái PWA</CardTitle>
        <CardDescription className="text-xs">
          Thông tin về ứng dụng và kết nối
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Trạng thái cài đặt:</span>
          <div className="flex items-center gap-1">
            {isInstalled ? (
              <>
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">Đã cài đặt</span>
              </>
            ) : canInstall ? (
              <>
                <Download className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600">Có thể cài đặt</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">Trình duyệt</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Kết nối:</span>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-orange-600">Offline</span>
              </>
            )}
          </div>
        </div>
        
        {canInstall && !isInstalled && (
          <Button
            onClick={installApp}
            size="sm"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Cài đặt ứng dụng
          </Button>
        )}
        
        {isUpdateAvailable && (
          <Button
            onClick={updateApp}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Cập nhật ứng dụng
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
