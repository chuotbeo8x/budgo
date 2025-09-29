import { NextResponse } from 'next/server';
import { lockUser } from '@/lib/actions/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body?.userId as string;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu userId' }, { status: 400 });
    }
    const result = await lockUser(userId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Có lỗi xảy ra khi khóa người dùng' }, { status: 500 });
  }
}






