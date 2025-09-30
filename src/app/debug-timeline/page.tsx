'use client';

import { useState } from 'react';
import DebugTimeline from '@/components/debug-timeline';

export default function DebugTimelinePage() {
    const [tripId, setTripId] = useState('');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">🔍 Timeline Debug</h1>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Trip ID:
                </label>
                <input
                    type="text"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    placeholder="Enter trip ID"
                    className="w-full p-2 border rounded"
                />
            </div>
            
            {tripId && (
                <DebugTimeline tripId={tripId} />
            )}
        </div>
    );
}
