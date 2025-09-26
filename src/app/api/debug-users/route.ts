import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    console.log('Getting all users from database...');
    
    // Get all users from Firestore
    const usersSnapshot = await adminDb.collection('users').get();
    
    const users = usersSnapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        id: doc.id,
        name: userData.name || '',
        email: userData.email || '',
        username: userData.username || '',
        avatar: userData.avatar || '',
        photoURL: userData.photoURL || '',
        role: userData.role || 'user',
        disabled: userData.disabled || false,
        createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate() : userData.createdAt,
        updatedAt: userData.updatedAt?.toDate ? userData.updatedAt.toDate() : userData.updatedAt,
      };
    });

    console.log(`Found ${users.length} users`);

    return NextResponse.json({ 
      success: true, 
      users: users 
    });

  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ 
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
