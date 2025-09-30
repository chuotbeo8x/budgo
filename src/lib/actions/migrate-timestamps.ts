/**
 * Migration script to update old timestamp data
 * This script updates expenses and advances that have date-only timestamps
 * to include the current time when they were created
 */

import { adminDb } from '../firebase-admin-new';

export async function migrateTimestamps() {
  console.log('🔄 Starting timestamp migration...');
  
  try {
    // Migrate expenses
    console.log('📊 Migrating expenses...');
    const expensesSnapshot = await adminDb.collection('expenses').get();
    let expensesUpdated = 0;
    
    for (const doc of expensesSnapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt;
      
      // Check if it's a date-only string (YYYY-MM-DD format)
      if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log(`🔄 Updating expense ${doc.id} from ${createdAt} to full timestamp`);
        
        // Create a new timestamp with current time
        const now = new Date();
        const newTimestamp = now.toISOString();
        
        await doc.ref.update({
          createdAt: newTimestamp,
          migratedAt: new Date().toISOString()
        });
        
        expensesUpdated++;
      }
    }
    
    console.log(`✅ Updated ${expensesUpdated} expenses`);
    
    // Migrate advances
    console.log('📊 Migrating advances...');
    const advancesSnapshot = await adminDb.collection('advances').get();
    let advancesUpdated = 0;
    
    for (const doc of advancesSnapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt;
      
      // Check if it's a date-only string (YYYY-MM-DD format)
      if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log(`🔄 Updating advance ${doc.id} from ${createdAt} to full timestamp`);
        
        // Create a new timestamp with current time
        const now = new Date();
        const newTimestamp = now.toISOString();
        
        await doc.ref.update({
          createdAt: newTimestamp,
          migratedAt: new Date().toISOString()
        });
        
        advancesUpdated++;
      }
    }
    
    console.log(`✅ Updated ${advancesUpdated} advances`);
    
    console.log('🎉 Migration completed successfully!');
    return {
      success: true,
      expensesUpdated,
      advancesUpdated,
      totalUpdated: expensesUpdated + advancesUpdated
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...');
  
  try {
    // Check expenses
    const expensesSnapshot = await adminDb.collection('expenses').get();
    let expensesWithDateOnly = 0;
    let expensesWithFullTimestamp = 0;
    
    for (const doc of expensesSnapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt;
      
      if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        expensesWithDateOnly++;
      } else if (typeof createdAt === 'string' && createdAt.includes('T')) {
        expensesWithFullTimestamp++;
      }
    }
    
    // Check advances
    const advancesSnapshot = await adminDb.collection('advances').get();
    let advancesWithDateOnly = 0;
    let advancesWithFullTimestamp = 0;
    
    for (const doc of advancesSnapshot.docs) {
      const data = doc.data();
      const createdAt = data.createdAt;
      
      if (typeof createdAt === 'string' && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
        advancesWithDateOnly++;
      } else if (typeof createdAt === 'string' && createdAt.includes('T')) {
        advancesWithFullTimestamp++;
      }
    }
    
    return {
      expenses: {
        total: expensesSnapshot.size,
        dateOnly: expensesWithDateOnly,
        fullTimestamp: expensesWithFullTimestamp
      },
      advances: {
        total: advancesSnapshot.size,
        dateOnly: advancesWithDateOnly,
        fullTimestamp: advancesWithFullTimestamp
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to check migration status:', error);
    throw error;
  }
}
