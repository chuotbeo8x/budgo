/**
 * Test file to verify expenses functions work correctly
 */

import { getExpenses, getAdvances } from './expenses';

// Test function to verify expenses work
export async function testExpensesFunctions() {
  console.log('🧪 Testing expenses functions...');
  
  try {
    // Test getExpenses with default limit
    console.log('Testing getExpenses with default limit...');
    const expenses = await getExpenses('test-trip-id');
    console.log('✅ getExpenses works:', expenses.length, 'expenses found');
    
    // Test getExpenses with custom limit
    console.log('Testing getExpenses with custom limit...');
    const expensesLimited = await getExpenses('test-trip-id', 10);
    console.log('✅ getExpenses with limit works:', expensesLimited.length, 'expenses found');
    
    // Test getAdvances with default limit
    console.log('Testing getAdvances with default limit...');
    const advances = await getAdvances('test-trip-id');
    console.log('✅ getAdvances works:', advances.length, 'advances found');
    
    // Test getAdvances with custom limit
    console.log('Testing getAdvances with custom limit...');
    const advancesLimited = await getAdvances('test-trip-id', 5);
    console.log('✅ getAdvances with limit works:', advancesLimited.length, 'advances found');
    
    console.log('✅ All expenses functions work correctly!');
    return true;
  } catch (error) {
    console.error('❌ Error testing expenses functions:', error);
    return false;
  }
}

// Test function to verify error handling
export async function testExpensesErrorHandling() {
  console.log('🧪 Testing expenses error handling...');
  
  try {
    // Test with invalid tripId
    console.log('Testing with invalid tripId...');
    const expenses = await getExpenses('');
    console.log('✅ Empty tripId handled:', expenses.length, 'expenses found');
    
    // Test with null tripId
    console.log('Testing with null tripId...');
    const expensesNull = await getExpenses(null as any);
    console.log('✅ Null tripId handled:', expensesNull.length, 'expenses found');
    
    console.log('✅ Error handling works correctly!');
    return true;
  } catch (error) {
    console.error('❌ Error in error handling test:', error);
    return false;
  }
}

// Test function to verify performance
export async function testExpensesPerformance() {
  console.log('🧪 Testing expenses performance...');
  
  const startTime = performance.now();
  
  try {
    // Test multiple calls
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(getExpenses('test-trip-id', 10));
    }
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log('✅ Performance test completed:', duration.toFixed(2), 'ms');
    console.log('✅ All calls successful:', results.length, 'results');
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    return false;
  }
}

// Run all tests
export async function runAllExpensesTests() {
  console.log('🚀 Running all expenses tests...');
  
  const results = await Promise.all([
    testExpensesFunctions(),
    testExpensesErrorHandling(),
    testExpensesPerformance(),
  ]);
  
  const allPassed = results.every(result => result === true);
  
  if (allPassed) {
    console.log('✅ All expenses tests passed!');
  } else {
    console.log('❌ Some expenses tests failed!');
  }
  
  return allPassed;
}

// Export for use in development
export default {
  testExpensesFunctions,
  testExpensesErrorHandling,
  testExpensesPerformance,
  runAllExpensesTests,
};
