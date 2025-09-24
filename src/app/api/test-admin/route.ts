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

    // Test basic connection
    const collections = await adminDb.listCollections();
    const collectionNames = collections.map(col => col.id);

    return NextResponse.json({
      success: true,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chuotbeo8x-229',
      collections: collectionNames
    });
  } catch (error) {
    console.error('Test admin error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}







