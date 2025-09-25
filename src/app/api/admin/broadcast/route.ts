import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { prepareFirestoreData } from '@/lib/utils/firestore';

export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Database chưa được khởi tạo' },
        { status: 500 }
      );
    }

    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Tiêu đề và nội dung không được để trống' },
        { status: 400 }
      );
    }

    // Get all users in the system
    const usersSnapshot = await adminDb.collection('users').get();
    const userIds = usersSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không có thành viên nào trong hệ thống' },
        { status: 400 }
      );
    }

    // Create broadcast notifications for all users
    const batch = adminDb!.batch();
    const notificationRefs = userIds.map(() => adminDb!.collection('notifications').doc());
    
    const broadcastNotifications = userIds.map(userId => ({
      userId,
      type: 'admin_broadcast',
      title,
      message,
      data: {
        isBroadcast: true,
        sentBy: 'admin', // You might want to get the actual admin user ID
      },
      isRead: false,
      createdAt: new Date(),
    }));

    // Add notifications to batch
    notificationRefs.forEach((ref, index) => {
      const notificationData = prepareFirestoreData(broadcastNotifications[index]);
      batch.set(ref, notificationData);
    });

    // Commit the batch
    await batch.commit();

    // Store broadcast history
    const broadcastHistoryRef = adminDb!.collection('broadcastHistory').doc();
    const historyData = {
      title,
      message,
      sentAt: new Date(),
      sentBy: 'admin', // You might want to get the actual admin user ID
      recipientCount: userIds.length,
    };

    await broadcastHistoryRef.set(prepareFirestoreData(historyData));

    return NextResponse.json({
      success: true,
      message: `Đã gửi thông báo đến ${userIds.length} thành viên`,
      recipientCount: userIds.length,
    });

  } catch (error) {
    console.error('Error sending broadcast:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi thông báo' },
      { status: 500 }
    );
  }
}
