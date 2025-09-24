import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('=== Test Simple API START ===');
    console.log('Admin DB available:', !!adminDb);
    
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Admin database not initialized',
        adminDbAvailable: false
      });
    }

    // Test basic connection with a simple query
    console.log('Testing basic connection...');
    const testQuery = adminDb.collection('tripMembers').limit(1);
    const testSnapshot = await testQuery.get();
    
    console.log('Test query successful');
    console.log('Found documents:', testSnapshot.docs.length);
    
    return NextResponse.json({
      success: true,
      adminDbAvailable: true,
      documentsFound: testSnapshot.docs.length,
      message: 'Admin DB is working correctly'
    });
  } catch (error) {
    console.error('=== Test Simple API ERROR ===');
    console.error('Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      adminDbAvailable: !!adminDb
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      adminDbAvailable: !!adminDb,
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}







