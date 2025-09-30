/**
 * Debug utilities for expenses functions
 */

import { adminDb } from '../firebase-admin-new';

// Debug function to check database connection
export async function debugDatabaseConnection() {
  console.log('🔍 Debugging database connection...');
  
  try {
    if (!adminDb) {
      console.error('❌ Admin database not initialized');
      return false;
    }
    
    console.log('✅ Admin database is initialized');
    
    // Test basic query
    const testQuery = adminDb.collection('expenses').limit(1);
    const testSnap = await testQuery.get();
    
    console.log('✅ Database query successful:', testSnap.size, 'documents found');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Debug function to check expenses collection
export async function debugExpensesCollection(tripId: string) {
  console.log('🔍 Debugging expenses collection for trip:', tripId);
  
  try {
    if (!adminDb) {
      console.error('❌ Admin database not initialized');
      return false;
    }
    
    // Check if trip exists
    const tripRef = adminDb.collection('trips').doc(tripId);
    const tripSnap = await tripRef.get();
    
    if (!tripSnap.exists) {
      console.error('❌ Trip not found:', tripId);
      return false;
    }
    
    console.log('✅ Trip exists:', tripSnap.data()?.name);
    
    // Check expenses for this trip
    const expensesQuery = adminDb.collection('expenses')
      .where('tripId', '==', tripId);
    
    const expensesSnap = await expensesQuery.get();
    console.log('✅ Expenses found:', expensesSnap.size);
    
    // Check first expense structure
    if (expensesSnap.size > 0) {
      const firstExpense = expensesSnap.docs[0];
      const data = firstExpense.data();
      console.log('✅ First expense structure:', {
        id: firstExpense.id,
        tripId: data.tripId,
        amount: data.amount,
        description: data.description,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Debug expenses collection failed:', error);
    return false;
  }
}

// Debug function to check advances collection
export async function debugAdvancesCollection(tripId: string) {
  console.log('🔍 Debugging advances collection for trip:', tripId);
  
  try {
    if (!adminDb) {
      console.error('❌ Admin database not initialized');
      return false;
    }
    
    // Check advances for this trip
    const advancesQuery = adminDb.collection('advances')
      .where('tripId', '==', tripId);
    
    const advancesSnap = await advancesQuery.get();
    console.log('✅ Advances found:', advancesSnap.size);
    
    // Check first advance structure
    if (advancesSnap.size > 0) {
      const firstAdvance = advancesSnap.docs[0];
      const data = firstAdvance.data();
      console.log('✅ First advance structure:', {
        id: firstAdvance.id,
        tripId: data.tripId,
        amount: data.amount,
        description: data.description,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Debug advances collection failed:', error);
    return false;
  }
}

// Debug function to check query performance
export async function debugQueryPerformance(tripId: string) {
  console.log('🔍 Debugging query performance for trip:', tripId);
  
  try {
    const startTime = performance.now();
    
    // Test expenses query
    const expensesQuery = adminDb.collection('expenses')
      .where('tripId', '==', tripId)
      .limit(10);
    
    const expensesSnap = await expensesQuery.get();
    const expensesTime = performance.now() - startTime;
    
    console.log('✅ Expenses query time:', expensesTime.toFixed(2), 'ms');
    console.log('✅ Expenses found:', expensesSnap.size);
    
    // Test advances query
    const advancesStartTime = performance.now();
    const advancesQuery = adminDb.collection('advances')
      .where('tripId', '==', tripId)
      .limit(10);
    
    const advancesSnap = await advancesQuery.get();
    const advancesTime = performance.now() - advancesStartTime;
    
    console.log('✅ Advances query time:', advancesTime.toFixed(2), 'ms');
    console.log('✅ Advances found:', advancesSnap.size);
    
    return true;
  } catch (error) {
    console.error('❌ Debug query performance failed:', error);
    return false;
  }
}

// Debug function to check data consistency
export async function debugDataConsistency(tripId: string) {
  console.log('🔍 Debugging data consistency for trip:', tripId);
  
  try {
    // Check expenses data consistency
    const expensesQuery = adminDb.collection('expenses')
      .where('tripId', '==', tripId)
      .limit(5);
    
    const expensesSnap = await expensesQuery.get();
    
    let validExpenses = 0;
    let invalidExpenses = 0;
    
    expensesSnap.docs.forEach((doc, index) => {
      const data = doc.data();
      
      // Check required fields
      const hasRequiredFields = data.tripId && data.amount && data.description;
      const hasValidAmount = typeof data.amount === 'number' && data.amount > 0;
      const hasValidCreatedAt = data.createdAt && (
        data.createdAt.toDate || 
        typeof data.createdAt === 'string' || 
        typeof data.createdAt === 'number' ||
        data.createdAt instanceof Date
      );
      
      if (hasRequiredFields && hasValidAmount && hasValidCreatedAt) {
        validExpenses++;
      } else {
        invalidExpenses++;
        console.warn(`❌ Invalid expense ${index}:`, {
          id: doc.id,
          hasRequiredFields,
          hasValidAmount,
          hasValidCreatedAt,
          data: {
            tripId: data.tripId,
            amount: data.amount,
            description: data.description,
            createdAt: data.createdAt,
          }
        });
      }
    });
    
    console.log('✅ Valid expenses:', validExpenses);
    console.log('❌ Invalid expenses:', invalidExpenses);
    
    return invalidExpenses === 0;
  } catch (error) {
    console.error('❌ Debug data consistency failed:', error);
    return false;
  }
}

// Run all debug functions
export async function runAllDebugFunctions(tripId: string) {
  console.log('🚀 Running all debug functions for trip:', tripId);
  
  const results = await Promise.all([
    debugDatabaseConnection(),
    debugExpensesCollection(tripId),
    debugAdvancesCollection(tripId),
    debugQueryPerformance(tripId),
    debugDataConsistency(tripId),
  ]);
  
  const allPassed = results.every(result => result === true);
  
  if (allPassed) {
    console.log('✅ All debug functions passed!');
  } else {
    console.log('❌ Some debug functions failed!');
  }
  
  return allPassed;
}

// Export for use in development
export default {
  debugDatabaseConnection,
  debugExpensesCollection,
  debugAdvancesCollection,
  debugQueryPerformance,
  debugDataConsistency,
  runAllDebugFunctions,
};
