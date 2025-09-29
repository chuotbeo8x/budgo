'use server';

import { adminDb } from '../firebase-admin';
import { Trip } from '../types';
import { prepareFirestoreData } from '../utils/firestore';

// Close Trip
export async function closeTrip(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if trip exists and user is owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể lưu trữ chuyến đi');
    }

    if (tripData.status === 'closed') {
      throw new Error('Chuyến đi đã được lưu trữ');
    }

    // Update trip status
    const updateData = {
      ...tripData,
      status: 'closed',
      closedAt: new Date(),
    };

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await tripRef.set(cleanedUpdateData, { merge: true });

    return { success: true, message: 'Lưu trữ chuyến đi thành công!' };
  } catch (error) {
    console.error('Error closing trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi lưu trữ chuyến đi');
  }
}

// Reopen Trip
export async function reopenTrip(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if trip exists and user is owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể khôi phục chuyến đi');
    }

    if (tripData.status === 'active') {
      throw new Error('Chuyến đi đang hoạt động');
    }

    // Update trip status
    const updateData = {
      ...tripData,
      status: 'active',
      closedAt: null,
    };

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await tripRef.set(cleanedUpdateData, { merge: true });

    return { success: true, message: 'Khôi phục chuyến đi thành công!' };
  } catch (error) {
    console.error('Error reopening trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi khôi phục chuyến đi');
  }
}

// Delete Trip
export async function deleteTrip(tripId: string, userId: string) {
  try {
    if (!adminDb) {
      console.error('Admin database not initialized');
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('Chưa đăng nhập');
    }

    // Check if trip exists and user is owner
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      throw new Error('Chuyến đi không tồn tại');
    }

    const tripData = tripSnap.data() as Trip;
    if (tripData.ownerId !== userId) {
      throw new Error('Chỉ chủ chuyến đi mới có thể xóa chuyến đi');
    }

    // Delete all related data
    const batch = adminDb.batch();

    // Delete trip
    batch.delete(tripRef);

    // Delete trip members
    const membersQuery = adminDb.collection('tripMembers').where('tripId', '==', tripId);
    const membersSnapshot = await membersQuery.get();
    membersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete expenses
    const expensesQuery = adminDb.collection('expenses').where('tripId', '==', tripId);
    const expensesSnapshot = await expensesQuery.get();
    expensesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete advances
    const advancesQuery = adminDb.collection('advances').where('tripId', '==', tripId);
    const advancesSnapshot = await advancesQuery.get();
    advancesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete settlements
    const settlementsQuery = adminDb.collection('settlements').where('tripId', '==', tripId);
    const settlementsSnapshot = await settlementsQuery.get();
    settlementsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Commit batch
    await batch.commit();

    return { success: true, message: 'Xóa chuyến đi thành công!' };
  } catch (error) {
    console.error('Error deleting trip:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa chuyến đi');
  }
}








