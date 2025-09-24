import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    // Test basic connection
    const testDoc = doc(db, 'test', 'connection');
    const testSnap = await getDoc(testDoc);
    console.log('✅ Firestore connection successful');
    
    // Test collections
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(query(usersCollection, limit(1)));
    console.log('✅ Users collection accessible, count:', usersSnapshot.docs.length);
    
    const groupsCollection = collection(db, 'groups');
    const groupsSnapshot = await getDocs(query(groupsCollection, limit(1)));
    console.log('✅ Groups collection accessible, count:', groupsSnapshot.docs.length);
    
    const groupMembersCollection = collection(db, 'groupMembers');
    const groupMembersSnapshot = await getDocs(query(groupMembersCollection, limit(1)));
    console.log('✅ GroupMembers collection accessible, count:', groupMembersSnapshot.docs.length);
    
    return {
      success: true,
      message: 'All Firestore connections working',
      collections: {
        users: usersSnapshot.docs.length,
        groups: groupsSnapshot.docs.length,
        groupMembers: groupMembersSnapshot.docs.length
      }
    };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    };
  }
}

export async function debugUserGroups(userId: string) {
  try {
    console.log('Debugging getUserGroups for user:', userId);
    
    // Check if user exists
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    console.log('User exists:', userSnap.exists());
    
    if (userSnap.exists()) {
      console.log('User data:', userSnap.data());
    }
    
    // Check group members
    const groupMembersCollection = collection(db, 'groupMembers');
    const allMembersQuery = query(groupMembersCollection, limit(10));
    const allMembersSnapshot = await getDocs(allMembersQuery);
    console.log('All group members (first 10):', allMembersSnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    // Check user's group members
    const userMembersQuery = query(
      groupMembersCollection,
      limit(10)
    );
    const userMembersSnapshot = await getDocs(userMembersQuery);
    const userMembers = userMembersSnapshot.docs.filter(doc => doc.data().userId === userId);
    console.log('User group members:', userMembers.map(doc => ({
      id: doc.id,
      data: doc.data()
    })));
    
    return {
      success: true,
      userExists: userSnap.exists(),
      userData: userSnap.exists() ? userSnap.data() : null,
      totalMembers: allMembersSnapshot.docs.length,
      userMembers: userMembers.length
    };
  } catch (error) {
    console.error('Debug getUserGroups failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    };
  }
}


