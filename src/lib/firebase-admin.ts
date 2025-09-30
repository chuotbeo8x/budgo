import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

console.log('Firebase Admin SDK: Starting initialization...');

// Try to load from environment variables first, then fallback to service account key file
let serviceAccount;

// First try environment variables (preferred method)
if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  console.log('Environment variables found');
  serviceAccount = {
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chuotbeo8x-229',
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
  };
  console.log('Service account project ID:', serviceAccount.project_id);
  console.log('Service account client email:', serviceAccount.client_email);
} else {
  console.error('Environment variables not found');
  throw new Error('Firebase Admin SDK requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables');
}

// Get project ID
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chuotbeo8x-229';

console.log('Using project ID:', projectId);

// Initialize Firebase Admin SDK
let adminApp;
let adminDb: Firestore | null;

try {
  if (serviceAccount) {
    console.log('Initializing Firebase Admin SDK with service account');
    console.log('Service account project_id:', serviceAccount.project_id);
    console.log('Service account client_email:', serviceAccount.client_email);
    
    adminApp = getApps().length === 0 ? initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    }) : getApps()[0];
  } else {
    console.log('No service account found');
    throw new Error('Firebase Admin SDK requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables');
  }
  
  if (adminApp) {
    adminDb = getFirestore(adminApp);
    console.log('Firebase Admin SDK initialized successfully');
    console.log('Admin DB instance:', !!adminDb);
  } else {
    console.error('Failed to initialize Firebase Admin SDK - adminApp is null');
    throw new Error('Failed to initialize Firebase Admin SDK');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Error details:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  });
  adminDb = null;
}

export { adminDb };
