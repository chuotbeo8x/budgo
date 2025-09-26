import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST() {
  try {
    console.log('Fix Google UID API called');
    
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Admin DB not initialized' });
    }

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    const updates = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const documentId = doc.id;
      
      // If googleUid is the same as document ID, it's wrong
      if (userData.googleUid === documentId) {
        console.log(`Fixing user ${documentId}: googleUid is ${userData.googleUid}, should be Firebase Auth UID`);
        
        // We need to get the actual Firebase Auth UID
        // For now, let's set it to null and let the user recreate their profile
        updates.push({
          docId: documentId,
          updateData: { googleUid: null }
        });
      }
    }

    // Apply updates
    const batch = adminDb.batch();
    for (const update of updates) {
      const docRef = adminDb.collection('users').doc(update.docId);
      batch.update(docRef, update.updateData);
    }
    
    if (updates.length > 0) {
      await batch.commit();
      console.log(`Updated ${updates.length} users`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updates.length} users`,
      updates: updates
    });

  } catch (error) {
    console.error('Fix Google UID API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
