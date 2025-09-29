import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

console.log('Firebase Admin SDK: Starting initialization...');

// Try to load service account key file first, then fallback to environment variables
let serviceAccount;
try {
  serviceAccount = require('./firebase-service-account.json');
  console.log('✅ Service account key file loaded successfully');
  console.log('📋 Project ID:', serviceAccount.project_id);
  console.log('📧 Client Email:', serviceAccount.client_email);
  console.log('🔑 Has Private Key:', !!serviceAccount.private_key);
} catch (error) {
  console.log('⚠️ Service account key file not found, trying environment variables...');
  
  // Fallback to environment variables
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('✅ Environment variables found');
    serviceAccount = {
      project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'chuotbeo8x-229',
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
    };
    console.log('📋 Project ID:', serviceAccount.project_id);
    console.log('📧 Client Email:', serviceAccount.client_email);
    console.log('🔑 Has Private Key:', !!serviceAccount.private_key);
  } else {
    console.error('❌ No service account key file or environment variables found');
    throw new Error('Firebase Admin SDK requires service account or environment variables');
  }
}

// Initialize Firebase Admin SDK with service account
let adminApp;
let adminDb: Firestore | null;

try {
  // Force initialize with service account
  if (getApps().length === 0) {
    console.log('🚀 Initializing new Firebase Admin app with service account...');
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } else {
    console.log('♻️ Using existing Firebase Admin app...');
    adminApp = getApps()[0];
  }
  
  if (adminApp) {
    adminDb = getFirestore(adminApp);
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log('🗄️ Admin DB instance created:', !!adminDb);
    console.log('🎯 Project ID from app:', adminApp.options.projectId);
  } else {
    throw new Error('Failed to initialize Firebase Admin app');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  adminDb = null;
  throw error;
}

export { adminDb };
