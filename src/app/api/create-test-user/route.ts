import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Create a test user
    const testUser = {
      googleUid: 'test-google-uid-123',
      email: 'test@example.com',
      name: 'Test User',
      username: 'chuotbeo8x',
      avatar: '',
      bio: 'This is a test user',
      phone: '+84123456789',
      location: 'Ho Chi Minh City',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if user already exists
    const existingQuery = adminDb.collection('users')
      .where('username', '==', 'chuotbeo8x')
      .limit(1);
    const existingSnapshot = await existingQuery.get();
    
    if (!existingSnapshot.empty) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: existingSnapshot.docs[0].data()
      });
    }

    // Create new user
    const userRef = adminDb.collection('users').doc();
    await userRef.set(testUser);

    return NextResponse.json({ 
      message: 'Test user created successfully',
      userId: userRef.id,
      user: testUser
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
  }
}


