'use server';

import { adminDb } from '../firebase-admin-new';
import { Notification } from '../types';
import { prepareFirestoreData } from '../utils/firestore';
import { safeToDate } from '../utils/date';

// Create notification
export async function createNotification(notification: Omit<Notification, 'id'>) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    const notificationData = prepareFirestoreData(notification);
    const docRef = await adminDb.collection('notifications').add(notificationData);
    
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Có lỗi xảy ra khi tạo thông báo');
  }
}

// Get user notifications
export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    console.log('getUserNotifications: Starting with userId:', userId, 'limit:', limit);
    
    if (!adminDb) {
      console.error('getUserNotifications: adminDb is null');
      // Return empty array instead of throwing error to prevent UI crashes
      console.warn('getUserNotifications: Returning empty array due to database unavailability');
      return [];
    }

    if (!userId) {
      console.error('getUserNotifications: userId is empty');
      throw new Error('User ID không được để trống');
    }

    console.log('getUserNotifications: Creating query...');
    const notificationsQuery = adminDb.collection('notifications')
      .where('userId', '==', userId)
      .limit(limit);

    console.log('getUserNotifications: Executing query...');
    const notificationsSnapshot = await notificationsQuery.get();
    console.log('getUserNotifications: Query executed, found', notificationsSnapshot.size, 'notifications');
    
    const notifications: Notification[] = [];
    notificationsSnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // Extract date fields before spreading
        const createdAt = safeToDate(data.createdAt) || new Date();
        const readAt = safeToDate(data.readAt);
        
        // Remove date fields from data to avoid conflicts
        const { createdAt: _, readAt: __, ...cleanData } = data;
        
        notifications.push({
          id: doc.id,
          ...cleanData,
          createdAt,
          readAt,
        } as Notification);
      } catch (docError) {
        console.error(`Error processing notification ${doc.id}:`, docError);
        // Skip this notification but continue processing others
      }
    });

    // Sort by createdAt descending in code (since we removed orderBy from query)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log('getUserNotifications: Successfully processed', notifications.length, 'notifications');
    return notifications;
  } catch (error) {
    console.error('getUserNotifications: Error getting user notifications:', error);
    console.error('getUserNotifications: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      limit
    });
    throw new Error('Có lỗi xảy ra khi lấy thông báo');
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('User ID không được để trống');
    }

    const notificationsQuery = adminDb.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false);

    const notificationsSnapshot = await notificationsQuery.get();
    
    return notificationsSnapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!notificationId || !userId) {
      throw new Error('Notification ID và User ID không được để trống');
    }

    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationSnap = await notificationRef.get();
    
    if (!notificationSnap.exists) {
      throw new Error('Thông báo không tồn tại');
    }

    const notificationData = notificationSnap.data() as Notification;
    if (notificationData.userId !== userId) {
      throw new Error('Bạn không có quyền đọc thông báo này');
    }

    const updateData = {
      isRead: true,
      readAt: new Date(),
    };

    const cleanedUpdateData = prepareFirestoreData(updateData);
    await notificationRef.update(cleanedUpdateData);

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi đánh dấu thông báo đã đọc');
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('User ID không được để trống');
    }

    const notificationsQuery = adminDb.collection('notifications')
      .where('userId', '==', userId)
      .where('isRead', '==', false);

    const notificationsSnapshot = await notificationsQuery.get();
    
    const batch = adminDb!.batch();
    const readAt = new Date();
    
    notificationsSnapshot.docs.forEach((doc) => {
      const notificationRef = adminDb!.collection('notifications').doc(doc.id);
      batch.update(notificationRef, {
        isRead: true,
        readAt: readAt,
      });
    });

    await batch.commit();

    return { success: true, updatedCount: notificationsSnapshot.size };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Có lỗi xảy ra khi đánh dấu tất cả thông báo đã đọc');
  }
}

// Delete notification
export async function deleteNotification(notificationId: string, userId: string) {
  try {
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!notificationId || !userId) {
      throw new Error('Notification ID và User ID không được để trống');
    }

    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationSnap = await notificationRef.get();
    
    if (!notificationSnap.exists) {
      throw new Error('Thông báo không tồn tại');
    }

    const notificationData = notificationSnap.data() as Notification;
    if (notificationData.userId !== userId) {
      throw new Error('Bạn không có quyền xóa thông báo này');
    }

    await notificationRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Có lỗi xảy ra khi xóa thông báo');
  }
}

// Helper functions to create specific notification types
export async function createGroupRequestNotification(
  ownerId: string,
  requesterId: string,
  requesterName: string,
  groupId: string,
  groupName: string,
  requestId: string
) {
  const notification: Omit<Notification, 'id'> = {
    userId: ownerId,
    type: 'group_request',
    title: `Yêu cầu tham gia nhóm "${groupName}"`,
    message: `${requesterName} muốn tham gia nhóm "${groupName}"`,
    data: {
      groupId,
      requestId,
      requesterId,
      requesterName,
      groupName,
    },
    isRead: false,
    createdAt: new Date(),
  };

  return await createNotification(notification);
}

export async function createTripCreatedNotification(
  memberIds: string[],
  tripName: string,
  tripId: string,
  groupId: string,
  groupName: string,
  creatorName: string
) {
  const notifications = memberIds.map(userId => ({
    userId,
    type: 'trip_created' as const,
    title: `Chuyến đi mới: "${tripName}"`,
    message: `${creatorName} đã tạo chuyến đi "${tripName}" trong nhóm "${groupName}"`,
    data: {
      groupId,
      tripId,
      tripName,
      groupName,
      creatorName,
    },
    isRead: false,
    createdAt: new Date(),
  }));

  // Create notifications in batch
  const batch = adminDb!.batch();
  const notificationRefs = notifications.map(() => adminDb!.collection('notifications').doc());
  
  notificationRefs.forEach((ref, index) => {
    const notificationData = prepareFirestoreData(notifications[index]);
    batch.set(ref, notificationData);
  });

  await batch.commit();
  return { success: true, count: notifications.length };
}

export async function createExpenseAddedNotification(
  memberIds: string[],
  expenseDescription: string,
  amount: number,
  currency: string,
  tripId: string,
  tripName: string,
  groupId: string,
  groupName: string,
  payerName: string
) {
  const notifications = memberIds.map(userId => ({
    userId,
    type: 'expense_added' as const,
    title: `Chi phí mới trong "${tripName}"`,
    message: `${payerName} đã thêm chi phí "${expenseDescription}" - ${currency} ${amount}`,
    data: {
      groupId,
      tripId,
      tripName,
      expenseDescription,
      amount,
      currency,
      payerName,
    },
    isRead: false,
    createdAt: new Date(),
  }));

  // Create notifications in batch
  const batch = adminDb!.batch();
  const notificationRefs = notifications.map(() => adminDb!.collection('notifications').doc());
  
  notificationRefs.forEach((ref, index) => {
    const notificationData = prepareFirestoreData(notifications[index]);
    batch.set(ref, notificationData);
  });

  await batch.commit();
  return { success: true, count: notifications.length };
}

export async function createGroupJoinedNotification(
  memberIds: string[],
  newMemberName: string,
  groupId: string,
  groupName: string
) {
  const notifications = memberIds.map(userId => ({
    userId,
    type: 'group_joined' as const,
    title: `Thành viên mới trong "${groupName}"`,
    message: `${newMemberName} đã tham gia nhóm "${groupName}"`,
    data: {
      groupId,
      groupName,
      newMemberName,
    },
    isRead: false,
    createdAt: new Date(),
  }));

  // Create notifications in batch
  const batch = adminDb!.batch();
  const notificationRefs = notifications.map(() => adminDb!.collection('notifications').doc());
  
  notificationRefs.forEach((ref, index) => {
    const notificationData = prepareFirestoreData(notifications[index]);
    batch.set(ref, notificationData);
  });

  await batch.commit();
  return { success: true, count: notifications.length };
}

export async function createSettlementReadyNotification(
  memberIds: string[],
  tripId: string,
  tripName: string,
  groupId: string,
  groupName: string
) {
  const notifications = memberIds.map(userId => ({
    userId,
    type: 'settlement_ready' as const,
    title: `Thanh toán sẵn sàng cho "${tripName}"`,
    message: `Chuyến đi "${tripName}" trong nhóm "${groupName}" đã sẵn sàng để thanh toán`,
    data: {
      groupId,
      tripId,
      tripName,
      groupName,
    },
    isRead: false,
    createdAt: new Date(),
  }));

  // Create notifications in batch
  const batch = adminDb!.batch();
  const notificationRefs = notifications.map(() => adminDb!.collection('notifications').doc());
  
  notificationRefs.forEach((ref, index) => {
    const notificationData = prepareFirestoreData(notifications[index]);
    batch.set(ref, notificationData);
  });

  await batch.commit();
  return { success: true, count: notifications.length };
}

