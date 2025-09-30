import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/actions/users';
import { withRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = withRateLimit(10, 60 * 60 * 1000)(request); // 10 requests per hour
  if (rateLimitResponse) return rateLimitResponse;

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
