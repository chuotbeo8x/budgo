'use client';

import { useState } from 'react';
import { getTripBySlug } from '@/lib/actions/trips';

export default function TestTripStatusPage() {
  const [tripSlug, setTripSlug] = useState('');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTripStatus = async () => {
    if (!tripSlug.trim()) {
      alert('Please enter a trip slug');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const tripData = await getTripBySlug(tripSlug);
      setTrip(tripData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Đang hoạt động',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'closed':
        return {
          label: 'Đã đóng',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          label: 'Không xác định',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧪 Test Trip Status</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">
              Trip Slug:
            </label>
            <input
              type="text"
              value={tripSlug}
              onChange={(e) => setTripSlug(e.target.value)}
              placeholder="Enter trip slug (e.g., ta-xi-lang)"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={testTripStatus}
            disabled={loading || !tripSlug.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Status'}
          </button>
        </div>
        
        {error && (
          <div className="border border-red-300 rounded p-4 bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {trip && (
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-2">📊 Trip Status Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Basic Info</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>ID:</strong> {trip.id}</div>
                  <div><strong>Name:</strong> {trip.name}</div>
                  <div><strong>Slug:</strong> {trip.slug}</div>
                  <div><strong>Owner:</strong> {trip.ownerId}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Status Info</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Raw Status:</strong> {trip.status}</div>
                  <div><strong>Status Type:</strong> {typeof trip.status}</div>
                  <div><strong>Is Active:</strong> {trip.status === 'active' ? 'Yes' : 'No'}</div>
                  <div><strong>Is Closed:</strong> {trip.status === 'closed' ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Status Display</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(trip.status).bgColor} ${getStatusInfo(trip.status).color}`}>
                  {getStatusInfo(trip.status).label}
                </span>
                <span className="text-sm text-gray-600">
                  (Raw: {trip.status})
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Logic Test</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <code>trip.status === 'active'</code>: 
                  <span className={trip.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                    {trip.status === 'active' ? ' ✅ True' : ' ❌ False'}
                  </span>
                </div>
                <div>
                  <code>trip.status === 'closed'</code>: 
                  <span className={trip.status === 'closed' ? 'text-green-600' : 'text-red-600'}>
                    {trip.status === 'closed' ? ' ✅ True' : ' ❌ False'}
                  </span>
                </div>
                <div>
                  <code>trip.status === 'open'</code>: 
                  <span className={trip.status === 'open' ? 'text-green-600' : 'text-red-600'}>
                    {trip.status === 'open' ? ' ✅ True' : ' ❌ False'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Raw Trip Data</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(trip, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="bg-blue-100 border border-blue-400 rounded p-4">
          <h3 className="font-semibold text-blue-800">🧪 Test Instructions:</h3>
          <ul className="list-disc list-inside text-blue-700 mt-2">
            <li>Enter trip slug (e.g., "ta-xi-lang")</li>
            <li>Click "Test Status" to load trip data</li>
            <li>Check the status logic and display</li>
            <li>Verify that status is correctly identified</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
