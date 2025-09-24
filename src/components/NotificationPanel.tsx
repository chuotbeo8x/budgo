'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Cake, Heart, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  birthdayMembers: any[];
}

export default function NotificationPanel({ 
  isOpen, 
  onClose, 
  unreadCount, 
  birthdayMembers 
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 300); // Match animation duration
  };

  const sendBirthdayWish = (memberId: string, memberName: string) => {
    toast.success(`Đã gửi lời chúc mừng sinh nhật đến ${memberName}! 🎉`);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`} />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isAnimating ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full" ref={panelRef}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Thông báo</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Birthday Notifications */}
            {birthdayMembers.length > 0 && (
              <div className="space-y-3 animate-in slide-in-from-bottom fade-in">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Cake className="w-4 h-4 text-pink-500" />
                  Sinh nhật hôm nay
                </div>
                
                {birthdayMembers.map((member, index) => (
                  <Card 
                    key={member.id} 
                    className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 animate-in slide-in-from-bottom fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {member.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {member.name}
                          </p>
                          {member.groupName && (
                            <p className="text-xs text-gray-500 truncate">
                              {member.groupName}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendBirthdayWish(member.id, member.name)}
                            className="h-8 w-8 p-0 hover:bg-pink-100"
                            title="Gửi lời chúc"
                          >
                            <Heart className="w-3 h-3 text-pink-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendBirthdayWish(member.id, member.name)}
                            className="h-8 w-8 p-0 hover:bg-pink-100"
                            title="Gửi quà"
                          >
                            <Gift className="w-3 h-3 text-purple-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Regular Notifications */}
            <div className="space-y-3 animate-in slide-in-from-bottom fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Bell className="w-4 h-4 text-blue-500" />
                Thông báo khác
              </div>
              
              {unreadCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Không có thông báo mới</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bạn có {unreadCount} thông báo chưa đọc</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Xem tất cả
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
