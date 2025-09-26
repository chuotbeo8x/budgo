import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/actions/users';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const result = await createUserProfile(formData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
