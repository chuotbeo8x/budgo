'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TripCreateForm from '@/components/TripCreateForm';
import { toast } from 'sonner';
import { getGroupBySlug, isGroupMember } from '@/lib/actions/groups';
import { createTrip } from '@/lib/actions/trips';
import { Group } from '@/lib/types';
import { generateTripSlug } from '@/lib/utils/slug';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  FileText,
  Tag
} from 'lucide-react';

export default function CreateGroupTripPage() {
  const { slug } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    currency: 'VND',
    category: '',
    coverUrl: ''
  });
  const [generatedSlug, setGeneratedSlug] = useState('');

  useEffect(() => {
    if (slug && typeof slug === 'string') {
      loadGroup(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (group && user) {
      checkMembership();
    }
  }, [group, user]);

  const loadGroup = async (groupSlug: string) => {
    try {
      setLoadingGroup(true);
      const groupData = await getGroupBySlug(groupSlug);
      if (groupData) {
        setGroup(groupData);
        setIsOwner(groupData.ownerId === user?.uid);
      } else {
        toast.error('Không tìm thấy nhóm');
        router.push('/groups/manage');
      }
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin nhóm');
    } finally {
      setLoadingGroup(false);
    }
  };

  const checkMembership = async () => {
    if (!group || !user) return;
    
    try {
      const member = await isGroupMember(group.id, user.uid);
      setIsMember(member);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'name') {
      const slug = generateTripSlug(value);
      setGeneratedSlug(slug || 'trip-' + Date.now());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!group || !user) return;
    
    try {
      setCreating(true);
      
      const tripData = {
        name: formData.name,
        description: formData.description,
        destination: formData.destination,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        currency: formData.currency,
        category: formData.category,
        coverUrl: formData.coverUrl,
        groupId: group.id
      };

      const result = await createTrip(tripData);
      
      if (result.success) {
        toast.success('Tạo chuyến đi thành công!');
        router.push(`/g/${group.slug}/trips/${result.slug}`);
      } else {
        toast.error('Có lỗi xảy ra khi tạo chuyến đi');
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setCreating(false);
    }
  };

  if (loading || loadingGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Không tìm thấy nhóm</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Bạn cần là thành viên của nhóm để tạo chuyến đi</p>
            <Button 
              onClick={() => router.push(`/g/${group.slug}`)}
              className="w-full mt-4"
            >
              Quay lại trang nhóm
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/g/${group.slug}/trips`)} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo chuyến đi mới</h1>
              <p className="text-gray-600 mt-1">Trong nhóm: {group.name}</p>
            </div>
          </div>
        </div>
        <TripCreateForm
          mode="group"
          group={group}
          onCancel={() => router.push(`/g/${group.slug}/trips`)}
          onSuccess={(slug) => router.push(`/g/${group.slug}/trips/${slug}`)}
        />
      </div>
    </div>
  );
}
