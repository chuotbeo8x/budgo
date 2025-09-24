import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu userId' }, { status: 400 });
    }
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database chưa được khởi tạo' }, { status: 500 });
    }
    await adminDb.collection('users').doc(userId).delete();
    return NextResponse.json({ success: true, message: 'Người dùng đã bị xóa' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Có lỗi xảy ra khi xóa người dùng' }, { status: 500 });
  }
}


