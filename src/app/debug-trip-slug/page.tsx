'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getTripBySlug, getUserTrips } from '@/lib/actions/trips';
import { toast } from 'sonner';

export default function DebugTripSlugPage() {
  const { user, loading } = useAuth();
  const [slug, setSlug] = useState('chuyen-di-choi-ca-nhan-ngoai-nhom');
  const [result, setResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserTrips();
    }
  }, [user]);

  const loadUserTrips = async () => {
    if (!user) return;
    
    try {
      const trips = await getUserTrips(user.uid);
      console.log('User trips:', trips);
      setResult({ userTrips: trips });
    } catch (error) {
      console.error('Error loading user trips:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách chuyến đi');
    }
  };

  const testSlug = async () => {
    if (!user || !slug.trim()) return;
    
    try {
      setTesting(true);
      
      // Test personal trip (groupId = null)
      let personalTrip = null;
      let personalError = null;
      try {
        personalTrip = await getTripBySlug(slug.trim(), undefined, user.uid);
      } catch (error) {
        personalError = error;
      }
      
      // Test group trip (we don't know groupId, so we'll try without it)
      let groupTrip = null;
      let groupError = null;
      try {
        // This might fail because we don't know the groupId
        groupTrip = await getTripBySlug(slug.trim(), undefined, user.uid);
      } catch (error) {
        groupError = error;
      }
      
      setResult({
        slug: slug.trim(),
        userId: user.uid,
        personalTrip: personalTrip ? 'Found' : 'Not found',
        personalError: personalError instanceof Error ? personalError.message : null,
        groupTrip: groupTrip ? 'Found' : 'Not found',
        groupError: groupError instanceof Error ? groupError.message : null,
        userTrips: result?.userTrips || []
      });
      
    } catch (error) {
      console.error('Error testing slug:', error);
      toast.error('Có lỗi xảy ra khi test slug');
    } finally {
      setTesting(false);
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
            Debug Trip Slug
          </h1>
          <p className="text-gray-600">
            Test trip slug access and find correct slugs
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

        {/* Slug Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Trip Slug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug">Trip Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Enter trip slug to test"
                />
              </div>
              
              <Button onClick={testSlug} disabled={testing || !slug.trim()}>
                {testing ? 'Testing...' : 'Test Slug'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Personal Trip:</strong> {result.personalTrip}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Group Trip:</strong> {result.groupTrip}
                  </div>
                </div>
                
                {result.personalError && (
                  <div className="p-3 bg-red-100 rounded">
                    <strong>Personal Error:</strong> {result.personalError}
                  </div>
                )}
                
                {result.groupError && (
                  <div className="p-3 bg-red-100 rounded">
                    <strong>Group Error:</strong> {result.groupError}
                  </div>
                )}
                
                <div>
                  <strong>Full Result:</strong>
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto mt-2">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Trips */}
        {result?.userTrips && (
          <Card>
            <CardHeader>
              <CardTitle>Your Trips (with correct slugs)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.userTrips.map((trip: any) => (
                  <div key={trip.id} className="border rounded p-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{trip.name}</h3>
                        <p className="text-sm text-gray-600">
                          ID: {trip.id} | Slug: <code className="bg-gray-100 px-1 rounded">{trip.slug}</code>
                        </p>
                        <p className="text-sm text-gray-600">
                          Type: {trip.groupId ? 'Group' : 'Personal'} | Owner: {trip.ownerId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(trip.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSlug(trip.slug);
                            testSlug();
                          }}
                        >
                          Test This Slug
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (trip.groupId) {
                              window.open(`/g/${trip.groupId}/trips/${trip.slug}`, '_blank');
                            } else {
                              window.open(`/trips/${trip.slug}`, '_blank');
                            }
                          }}
                        >
                          Open Trip
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
