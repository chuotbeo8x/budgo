import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Admin database not initialized'
      });
    }

    // Test tripMembers collection
    const membersSnapshot = await adminDb.collection('tripMembers').limit(5).get();
    const members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      count: membersSnapshot.docs.length,
      sample: members
    });
  } catch (error) {
    console.error('Test trip members error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}







