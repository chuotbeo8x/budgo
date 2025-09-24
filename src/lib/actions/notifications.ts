'use server';

import { adminDb } from '../firebase-admin';
import { Notification } from '../types';
import { prepareFirestoreData } from '../utils/firestore';

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
    if (!adminDb) {
      throw new Error('Database chưa được khởi tạo');
    }

    if (!userId) {
      throw new Error('User ID không được để trống');
    }

    const notificationsQuery = adminDb.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const notificationsSnapshot = await notificationsQuery.get();
    
    const notifications: Notification[] = [];
    notificationsSnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt,
      } as Notification);
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
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
    
    const batch = adminDb.batch();
    const readAt = new Date();
    
    notificationsSnapshot.docs.forEach((doc) => {
      const notificationRef = adminDb.collection('notifications').doc(doc.id);
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

// Create group invite notification
export async function createGroupInviteNotification(
  invitedUserId: string,
  groupId: string,
  groupName: string,
  invitedBy: string,
  invitedByName: string,
  inviteId: string,
  message?: string
) {
  try {
    const notification: Omit<Notification, 'id'> = {
      userId: invitedUserId,
      type: 'group_invite',
      title: `Lời mời tham gia nhóm "${groupName}"`,
      message: message || `${invitedByName} đã mời bạn tham gia nhóm "${groupName}"`,
      data: {
        groupId,
        inviteId,
        invitedBy,
        invitedByName,
        groupName,
      },
      isRead: false,
      createdAt: new Date(),
    };

    return await createNotification(notification);
  } catch (error) {
    console.error('Error creating group invite notification:', error);
    throw new Error('Có lỗi xảy ra khi tạo thông báo mời nhóm');
  }
}
