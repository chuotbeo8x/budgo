/**
 * Check current timestamp data in database
 */

import { adminDb } from '../firebase-admin-new';

export async function checkTimestamps() {
  console.log('🔍 Checking timestamp data...');
  
  try {
    // Check expenses
    const expensesSnapshot = await adminDb.collection('expenses').limit(10).get();
    console.log('📊 Found', expensesSnapshot.size, 'expenses');
    
    const expenses = expensesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
        isDateOnly: typeof data.createdAt === 'string' && data.createdAt.match(/^\d{4}-\d{2}-\d{2}$/),
        isFullTimestamp: typeof data.createdAt === 'string' && data.createdAt.includes('T'),
        parsed: data.createdAt ? new Date(data.createdAt).toISOString() : null
      };
    });
    
    // Check advances
    const advancesSnapshot = await adminDb.collection('advances').limit(10).get();
    console.log('📊 Found', advancesSnapshot.size, 'advances');
    
    const advances = advancesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
        isDateOnly: typeof data.createdAt === 'string' && data.createdAt.match(/^\d{4}-\d{2}-\d{2}$/),
        isFullTimestamp: typeof data.createdAt === 'string' && data.createdAt.includes('T'),
        parsed: data.createdAt ? new Date(data.createdAt).toISOString() : null
      };
    });
    
    // Summary
    const expensesDateOnly = expenses.filter(e => e.isDateOnly).length;
    const expensesFullTimestamp = expenses.filter(e => e.isFullTimestamp).length;
    const advancesDateOnly = advances.filter(a => a.isDateOnly).length;
    const advancesFullTimestamp = advances.filter(a => a.isFullTimestamp).length;
    
    return {
      expenses: {
        total: expenses.length,
        dateOnly: expensesDateOnly,
        fullTimestamp: expensesFullTimestamp,
        data: expenses
      },
      advances: {
        total: advances.length,
        dateOnly: advancesDateOnly,
        fullTimestamp: advancesFullTimestamp,
        data: advances
      },
      summary: {
        totalItems: expenses.length + advances.length,
        totalDateOnly: expensesDateOnly + advancesDateOnly,
        totalFullTimestamp: expensesFullTimestamp + advancesFullTimestamp
      }
    };
    
  } catch (error) {
    console.error('❌ Error checking timestamps:', error);
    throw error;
  }
}

export async function getRecentExpenses(tripId: string) {
  try {
    const expensesSnapshot = await adminDb.collection('expenses')
      .where('tripId', '==', tripId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    return expensesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        description: data.description,
        amount: data.amount,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
        isDateOnly: typeof data.createdAt === 'string' && data.createdAt.match(/^\d{4}-\d{2}-\d{2}$/),
        isFullTimestamp: typeof data.createdAt === 'string' && data.createdAt.includes('T'),
        parsed: data.createdAt ? new Date(data.createdAt).toISOString() : null,
        formatted: data.createdAt ? new Date(data.createdAt).toLocaleString('vi-VN') : null
      };
    });
    
  } catch (error) {
    console.error('❌ Error getting recent expenses:', error);
    throw error;
  }
}
