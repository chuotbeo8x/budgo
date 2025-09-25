import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, message: 'Database chưa được khởi tạo' },
        { status: 500 }
      );
    }

    // Get broadcast history
    const historySnapshot = await adminDb.collection('broadcastHistory')
      .orderBy('sentAt', 'desc')
      .limit(20)
      .get();

    const history = historySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        message: data.message,
        sentAt: data.sentAt?.toDate ? data.sentAt.toDate() : data.sentAt,
        sentBy: data.sentBy,
        recipientCount: data.recipientCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.error('Error getting broadcast history:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi lấy lịch sử thông báo' },
      { status: 500 }
    );
  }
}
