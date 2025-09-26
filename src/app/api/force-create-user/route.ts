import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database not initialized' }, { status: 500 });
    }

    const { userId, email, displayName, photoURL } = await request.json();
    
    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'User ID and email required' }, { status: 400 });
    }

    console.log('Force creating user:', userId);

    // 1. Xóa tất cả user có googleUid = userId
    const usersQuery = adminDb.collection('users').where('googleUid', '==', userId);
    const usersSnapshot = await usersQuery.get();
    
    console.log(`Found ${usersSnapshot.size} users with googleUid: ${userId}`);
    
    // Xóa tất cả user tìm được
    const batch = adminDb.batch();
    usersSnapshot.docs.forEach(doc => {
      console.log('Deleting user document:', doc.id);
      batch.delete(doc.ref);
    });
    
    if (usersSnapshot.size > 0) {
      await batch.commit();
      console.log('Deleted all existing users');
    }

    // 2. Xóa user có document ID = userId (nếu có)
    try {
      const userRef = adminDb.collection('users').doc(userId);
      const userSnap = await userRef.get();
      
      if (userSnap.exists) {
        await userRef.delete();
        console.log('Deleted user with document ID:', userId);
      }
    } catch (error) {
      console.log('No user with document ID:', userId);
    }

    // 3. Tạo user mới với document ID = userId
    const newUser = {
      name: displayName || 'Người dùng mới',
      email: email,
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      avatar: photoURL || '',
      googleUid: userId,
      role: 'user',
      disabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating new user:', newUser);

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set(newUser);
    
    console.log('User created successfully with document ID:', userId);

    return NextResponse.json({ 
      success: true, 
      message: `User created successfully with document ID: ${userId}`,
      user: newUser
    });

  } catch (error) {
    console.error('Error force creating user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to force create user' 
    }, { status: 500 });
  }
}
