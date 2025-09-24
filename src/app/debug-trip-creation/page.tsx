'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTrip, getTripBySlug, isTripMember, getUserTrips } from '@/lib/actions/trips';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DebugTripCreationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: 'Test Trip ' + Date.now(),
    description: 'Test trip for debugging',
    currency: 'VND',
    groupId: '', // Empty for personal trip
    startDate: '',
    endDate: '',
    destination: 'Test Destination',
  });
  const [creating, setCreating] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [accessTest, setAccessTest] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setCreating(true);
      
      // Create form data
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('currency', formData.currency);
      if (formData.groupId) data.append('groupId', formData.groupId);
      if (formData.startDate) data.append('startDate', formData.startDate);
      if (formData.endDate) data.append('endDate', formData.endDate);
      if (formData.destination) data.append('destination', formData.destination);
      data.append('userId', user.uid);

      console.log('Creating trip with data:', Object.fromEntries(data.entries()));
      
      const result = await createTrip(data);
      console.log('Create trip result:', result);
      
      if (result.success) {
        setCreatedTrip(result);
        toast.success('Tạo chuyến đi thành công!');
        
        // Test access immediately
        await testAccess(result.slug, result.tripId);
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo chuyến đi');
    } finally {
      setCreating(false);
    }
  };

  const testAccess = async (slug: string, tripId: string) => {
    if (!user) return;
    
    try {
      console.log('Testing access for trip:', { slug, tripId, userId: user.uid });
      
      // Test 1: Check if user is trip member
      const isMember = await isTripMember(tripId, user.uid);
      console.log('Is member result:', isMember);
      
      // Test 2: Try to get trip by slug
      let tripBySlug = null;
      let slugError = null;
      try {
        tripBySlug = await getTripBySlug(slug, undefined, user.uid);
        console.log('Get trip by slug result:', tripBySlug);
      } catch (error) {
        slugError = error;
        console.error('Get trip by slug error:', error);
      }
      
      // Test 3: Check user trips
      const userTrips = await getUserTrips(user.uid);
      const foundInUserTrips = userTrips.find(trip => trip.id === tripId);
      console.log('User trips:', userTrips);
      console.log('Found in user trips:', foundInUserTrips);
      
      setAccessTest({
        tripId,
        slug,
        userId: user.uid,
        isMember,
        tripBySlug: tripBySlug ? 'Success' : 'Failed',
        slugError: slugError instanceof Error ? slugError.message : null,
        foundInUserTrips: foundInUserTrips ? 'Yes' : 'No',
        userTripsCount: userTrips.length,
        userTrips: userTrips
      });
      
    } catch (error) {
      console.error('Error testing access:', error);
      setAccessTest({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Debug Trip Creation & Access
          </h1>
          <p className="text-gray-600">
            Test trip creation and access control
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

        {/* Trip Creation Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create Test Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="groupId">Group ID (leave empty for personal trip)</Label>
                <Input
                  id="groupId"
                  value={formData.groupId}
                  onChange={(e) => setFormData({...formData, groupId: e.target.value})}
                  placeholder="Optional - for group trips"
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
              
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create Trip & Test Access'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Creation Result */}
        {createdTrip && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Creation Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(createdTrip, null, 2)}
              </pre>
              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => router.push(`/trips/${createdTrip.slug}`)}
                  variant="outline"
                >
                  Try to Access Trip
                </Button>
                <Button 
                  onClick={() => testAccess(createdTrip.slug, createdTrip.tripId)}
                  variant="outline"
                >
                  Test Access Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Access Test Result */}
        {accessTest && (
          <Card>
            <CardHeader>
              <CardTitle>Access Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Is Member:</strong> {accessTest.isMember ? '✅ Yes' : '❌ No'}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Trip By Slug:</strong> {accessTest.tripBySlug}
                  </div>
                </div>
                
                {accessTest.slugError && (
                  <div className="p-3 bg-red-100 rounded">
                    <strong>Slug Error:</strong> {accessTest.slugError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Found in User Trips:</strong> {accessTest.foundInUserTrips}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>User Trips Count:</strong> {accessTest.userTripsCount}
                  </div>
                </div>
                
                <div>
                  <strong>Full Debug Data:</strong>
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto mt-2">
                    {JSON.stringify(accessTest, null, 2)}
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
