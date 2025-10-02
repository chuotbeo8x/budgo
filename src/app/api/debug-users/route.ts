import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Admin database not initialized' }, { status: 500 });
    }

    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      lastLoginAt: doc.data().lastLoginAt?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
