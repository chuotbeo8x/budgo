'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import TripCreateForm from '@/components/TripCreateForm';
import { getUserGroups } from '@/lib/actions/groups';
import { Group } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import LoginPrompt from '@/components/auth/LoginPrompt';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreateTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const groupId = searchParams.get('groupId');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      loadGroups();
    }
  }, [loading, user]);

  const loadGroups = async () => {
    if (!user) return;
    
    try {
      setLoadingGroups(true);
      const userGroups = await getUserGroups(user.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách nhóm');
    } finally {
      setLoadingGroups(false);
    }
  };

  if (loading || loadingGroups) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Cần đăng nhập"
        description="Vui lòng đăng nhập để tạo chuyến đi"
        icon={<MapPin className="w-8 h-8 text-blue-600" />}
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <TripCreateForm
          mode={groupId ? 'group' : 'personal'}
          group={groupId ? (groups.find(g => g.id === groupId) as Group | undefined) || null : null}
          onCancel={() => router.push(groupId ? `/g/${groupId}/trips` : '/trips/manage')}
          onSuccess={(slug) => router.push(groupId ? `/g/${groupId}/trips/${slug}` : `/trips/${slug}`)}
        />
      </div>
    </div>
  );
}