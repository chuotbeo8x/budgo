import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { toDate } from '@/lib/utils/date';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database chưa được khởi tạo' }, { status: 500 });
    }

    const snapshot = await adminDb.collection('users').limit(1000).get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const totalUsers = users.length;
    const lockedUsers = users.filter((u: any) => u.disabled === true).length;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter((u: any) => {
      const updated = u.updatedAt?.toDate ? u.updatedAt.toDate() : toDate(u.updatedAt);
      const created = u.createdAt?.toDate ? u.createdAt.toDate() : toDate(u.createdAt);
      const reference = (updated && !isNaN(updated.getTime())) ? updated : created;
      return reference && !isNaN(reference.getTime()) && reference >= sevenDaysAgo;
    }).length;

    return NextResponse.json({ success: true, data: { totalUsers, activeUsers, lockedUsers } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Có lỗi xảy ra khi lấy thống kê' }, { status: 500 });
  }
}




