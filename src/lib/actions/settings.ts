'use server';

import { adminDb } from '../firebase-admin';
import { prepareFirestoreData } from '../utils/firestore';

const SETTINGS_DOC_ID = 'app';

export type AppSettings = {
  maintenanceEnabled: boolean;
  logoUrl?: string;
  siteName?: string;
  copyright?: string;
  updatedAt?: Date;
  updatedBy?: string;
};

export async function getAppSettings(): Promise<AppSettings | null> {
  if (!adminDb) return null;
  const ref = adminDb.collection('settings').doc(SETTINGS_DOC_ID);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as any;
  return {
    maintenanceEnabled: !!data.maintenanceEnabled,
    logoUrl: data.logoUrl || undefined,
    siteName: data.siteName || undefined,
    copyright: data.copyright || undefined,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt || undefined),
    updatedBy: data.updatedBy || undefined,
  };
}

export async function updateAppSettings(partial: Partial<AppSettings> & { updatedBy?: string }) {
  if (!adminDb) throw new Error('Database chưa được khởi tạo');
  const ref = adminDb.collection('settings').doc(SETTINGS_DOC_ID);
  const payload = prepareFirestoreData({
    ...partial,
    updatedAt: new Date(),
  });
  await ref.set(payload, { merge: true });
  return { success: true };
}


