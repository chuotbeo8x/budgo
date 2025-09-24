import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    console.log('Searching for user:', userId);

    // Try by username first
    const usernameQuery = adminDb.collection('users')
      .where('username', '==', userId)
      .limit(1);
    const usernameSnapshot = await usernameQuery.get();
    
    console.log('Username query result:', usernameSnapshot.empty ? 'empty' : 'found');
    
    let userDoc;
    if (!usernameSnapshot.empty) {
      userDoc = usernameSnapshot.docs[0];
      console.log('Found by username');
    } else {
      // Try by ID
      console.log('Searching by ID:', userId);
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        userDoc = userSnap;
        console.log('Found by ID');
      }
    }

    if (!userDoc) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const result = {
      id: userDoc.id,
      ...userData,
      createdAt: userData?.createdAt?.toDate?.() || userData?.createdAt
    };

    console.log('User found:', result);

    return NextResponse.json({ user: result });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}


