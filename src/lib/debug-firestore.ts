'use server';

import { adminDb } from './firebase-admin';

export async function debugFirestoreData() {
  try {
    console.log('=== DEBUG: Firestore Data ===');
    
    // Check groups collection
    const groupsSnapshot = await adminDb.collection('groups').limit(10).get();
    console.log('Groups count:', groupsSnapshot.docs.length);
    
    groupsSnapshot.docs.forEach((doc, index) => {
      console.log(`Group ${index}:`, {
        id: doc.id,
        data: doc.data()
      });
    });
    
    // Check groupMembers collection
    const membersSnapshot = await adminDb.collection('groupMembers').limit(10).get();
    console.log('Group members count:', membersSnapshot.docs.length);
    
    membersSnapshot.docs.forEach((doc, index) => {
      console.log(`Member ${index}:`, {
        id: doc.id,
        data: doc.data()
      });
    });
    
    return {
      success: true,
      groupsCount: groupsSnapshot.docs.length,
      membersCount: membersSnapshot.docs.length,
      groups: groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      members: membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (error) {
    console.error('Debug Firestore error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}







