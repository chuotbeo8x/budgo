import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/actions/users';

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
    
    const userProfile = await getUserById(userId);
    
    return NextResponse.json({
      success: true,
      hasProfile: !!userProfile,
      profile: userProfile
    });
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
