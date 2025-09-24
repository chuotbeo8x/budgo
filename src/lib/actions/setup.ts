'use server';

import { adminDb } from '../firebase-admin';
import { User } from '../types';
import { prepareFirestoreData } from '../utils/firestore';

// Create sample user data for testing
export async function createSampleUser(userId: string, userData: { name: string; email: string }) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (userSnap.exists) {
      console.log('User already exists:', userId);
      return userSnap.data() as User;
    }

    const newUser: Omit<User, 'id'> = {
      name: userData.name,
      email: userData.email,
      username: userData.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(),
    };

    const cleanedUserData = prepareFirestoreData(newUser);
    await userRef.set(cleanedUserData);

    console.log('Created sample user:', userId, userData);
    return { id: userId, ...cleanedUserData } as User;
  } catch (error) {
    console.error('Error creating sample user:', error);
    throw new Error('Có lỗi xảy ra khi tạo user mẫu');
  }
}

// Setup sample data for testing
export async function setupSampleData(userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    // Create sample user if not exists
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) {
      // Get user data from Firebase Auth (this would need to be passed from client)
      // For now, create with default data
      const sampleUser: Omit<User, 'id'> = {
        name: 'Bạn',
        email: 'user@example.com',
        username: 'user',
        createdAt: new Date(),
      };

      const cleanedUserData = prepareFirestoreData(sampleUser);
      await userRef.set(cleanedUserData);
      
      console.log('Created sample user data for:', userId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting up sample data:', error);
    throw new Error('Có lỗi xảy ra khi setup dữ liệu mẫu');
  }
}






