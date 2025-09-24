'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserTrips, isTripMember, getTripBySlug } from '@/lib/actions/trips';
import { toast } from 'sonner';

export default function DebugTripAccessPage() {
  const { user, loading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [membershipCheck, setMembershipCheck] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    if (!user) return;
    
    try {
      setLoadingTrips(true);
      const tripsData = await getUserTrips(user.uid);
      setTrips(tripsData);
      console.log('Loaded trips:', tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    } finally {
      setLoadingTrips(false);
    }
  };

  const checkTripMembership = async (trip: any) => {
    if (!user) return;
    
    try {
      setSelectedTrip(trip);
      
      // Check if user is trip owner
      const isOwner = user.uid === trip.ownerId;
      
      // Check if user is trip member
      const isMember = await isTripMember(trip.id, user.uid);
      
      // Get trip details by slug
      let tripBySlug = null;
      try {
        // For personal trips, groupId should be null, not undefined
        const groupId = trip.groupId || null;
        tripBySlug = await getTripBySlug(trip.slug, groupId, user.uid);
      } catch (error) {
        console.error('Error getting trip by slug:', error);
      }
      
      setMembershipCheck({
        tripId: trip.id,
        tripSlug: trip.slug,
        userId: user.uid,
        ownerId: trip.ownerId,
        isOwner,
        isMember,
        tripBySlug: tripBySlug ? 'Success' : 'Failed',
        tripData: trip
      });
      
      console.log('Membership check result:', {
        isOwner,
        isMember,
        tripBySlug: tripBySlug ? 'Success' : 'Failed'
      });
    } catch (error) {
      console.error('Error checking membership:', error);
      toast.error('Có lỗi xảy ra khi kiểm tra quyền truy cập');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để debug trip access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug Trip Access
          </h1>
          <p className="text-gray-600">
            Debug trip membership and access control issues
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Trips List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Trips ({trips.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTrips ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : trips.length === 0 ? (
              <p className="text-gray-500">Không có chuyến đi nào</p>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{trip.name}</h3>
                        <p className="text-sm text-gray-600">
                          ID: {trip.id} | Slug: {trip.slug}
                        </p>
                        <p className="text-sm text-gray-600">
                          Owner: {trip.ownerId} | Type: {trip.groupId ? 'Group' : 'Personal'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(trip.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <Button 
                        onClick={() => checkTripMembership(trip)}
                        size="sm"
                        variant="outline"
                      >
                        Check Access
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Membership Check Result */}
        {membershipCheck && (
          <Card>
            <CardHeader>
              <CardTitle>Membership Check Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Is Owner:</strong> {membershipCheck.isOwner ? '✅ Yes' : '❌ No'}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Is Member:</strong> {membershipCheck.isMember ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-100 rounded">
                  <strong>Get Trip By Slug:</strong> {membershipCheck.tripBySlug}
                </div>
                
                <div>
                  <strong>Full Debug Data:</strong>
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto mt-2">
                    {JSON.stringify(membershipCheck, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
