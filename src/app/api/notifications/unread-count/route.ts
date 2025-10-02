import { NextRequest, NextResponse } from 'next/server';
import { getUnreadNotificationsCount } from '@/lib/actions/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const count = await getUnreadNotificationsCount(userId);

    return NextResponse.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
