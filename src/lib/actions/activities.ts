'use server';

import { adminDb } from '@/lib/firebase-admin';
import { GroupActivity, GroupActivityType } from '@/lib/types';
import { getUserById } from './users';

interface LogActivityPayload {
  tripId?: string;
  tripName?: string;
  amount?: number;
  currency?: 'VND' | 'USD';
  memberName?: string;
  expenseDescription?: string;
}

export async function logGroupActivity(
  groupId: string,
  type: GroupActivityType,
  actorId?: string,
  payload?: LogActivityPayload
) {
  try {
    if (!adminDb) {
      console.error('Admin DB not available');
      return;
    }

    const data = {
      groupId,
      type,
      actorId: actorId || null,
      createdAt: new Date(),
      payload: payload || null,
    } as any;

    await adminDb.collection('groupActivities').add(data);
  } catch (error) {
    console.error('Error logging group activity:', { groupId, type, actorId, payload, error });
  }
}

export async function getGroupActivities(groupId: string, limit: number = 20, lastDoc?: any) {
  try {
    if (!adminDb) {
      throw new Error('Admin DB not available');
    }

    let query = adminDb
      .collection('groupActivities')
      .where('groupId', '==', groupId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snap = await query.get();
    const activities: GroupActivity[] = [];

    for (const doc of snap.docs) {
      const d = doc.data();

      activities.push({
        id: doc.id,
        groupId: d.groupId,
        type: d.type,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
        actorId: d.actorId || undefined,
        payload: d.payload || undefined,
        actorName: 'Người dùng', // Temporarily remove user lookup to fix recursion
        actorAvatar: undefined,
      });
    }

    return {
      activities,
      hasMore: snap.docs.length === limit,
      lastDoc: null, // Don't return Firestore snapshot - causes serialization issues
    };
  } catch (error) {
    console.error('Error getting group activities:', error);
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('requires an index')) {
      console.warn('Activities index not ready yet, returning empty list temporarily');
      return { activities: [], hasMore: false, lastDoc: null };
    }
    throw new Error('Có lỗi xảy ra khi tải hoạt động nhóm');
  }
}


