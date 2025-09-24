import { NextResponse } from 'next/server';
import { unlockUser } from '@/lib/actions/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body?.userId as string;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu userId' }, { status: 400 });
    }
    const result = await unlockUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Có lỗi xảy ra khi mở khóa người dùng' }, { status: 500 });
  }
}




