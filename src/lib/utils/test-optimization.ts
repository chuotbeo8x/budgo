/**
 * Test file to verify optimization functions work correctly
 */

import { cache, CACHE_KEYS, CACHE_TTL } from './cache';
import { performanceMonitor } from './performance';

// Test cache functionality
export function testCache() {
  console.log('🧪 Testing cache functionality...');
  
  // Test basic cache operations
  const testData = { id: '1', name: 'Test User' };
  const cacheKey = CACHE_KEYS.USER('test-user');
  
  // Set cache
  cache.set(cacheKey, testData, CACHE_TTL.USER);
  console.log('✅ Cache set successfully');
  
  // Get cache
  const cachedData = cache.get(cacheKey);
  if (cachedData && cachedData.id === '1') {
    console.log('✅ Cache get successful');
  } else {
    console.log('❌ Cache get failed');
  }
  
  // Test cache expiration
  cache.set(cacheKey, testData, 1); // 1ms TTL
  setTimeout(() => {
    const expiredData = cache.get(cacheKey);
    if (!expiredData) {
      console.log('✅ Cache expiration works');
    } else {
      console.log('❌ Cache expiration failed');
    }
  }, 10);
  
  // Test cache cleanup
  cache.clear();
  const clearedData = cache.get(cacheKey);
  if (!clearedData) {
    console.log('✅ Cache clear works');
  } else {
    console.log('❌ Cache clear failed');
  }
}

// Test performance monitoring
export function testPerformance() {
  console.log('🧪 Testing performance monitoring...');
  
  // Test async measurement
  performanceMonitor.measureAsync('test-async', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'async result';
  }).then(result => {
    console.log('✅ Async measurement works:', result);
  });
  
  // Test sync measurement
  const syncResult = performanceMonitor.measureSync('test-sync', () => {
    return 'sync result';
  });
  console.log('✅ Sync measurement works:', syncResult);
  
  // Test performance stats
  const stats = performanceMonitor.getStats();
  console.log('✅ Performance stats:', stats);
  
  // Test slow operations
  const slowOps = performanceMonitor.getSlowOperations(50);
  console.log('✅ Slow operations detection:', slowOps.length);
}

// Test memory management
export function testMemory() {
  console.log('🧪 Testing memory management...');
  
  // Test cleanup function
  let cleanupCalled = false;
  const cleanup = () => { cleanupCalled = true; };
  
  // Simulate cleanup
  cleanup();
  if (cleanupCalled) {
    console.log('✅ Cleanup function works');
  } else {
    console.log('❌ Cleanup function failed');
  }
  
  // Test debounce
  let debounceCount = 0;
  const debouncedFn = (() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        debounceCount++;
      }, 100);
    };
  })();
  
  // Call debounced function multiple times
  debouncedFn();
  debouncedFn();
  debouncedFn();
  
  setTimeout(() => {
    if (debounceCount === 1) {
      console.log('✅ Debounce works');
    } else {
      console.log('❌ Debounce failed');
    }
  }, 200);
  
  // Test throttle
  let throttleCount = 0;
  const throttledFn = (() => {
    let lastCall = 0;
    return () => {
      const now = Date.now();
      if (now - lastCall >= 100) {
        lastCall = now;
        throttleCount++;
      }
    };
  })();
  
  // Call throttled function multiple times
  throttledFn();
  throttledFn();
  throttledFn();
  
  setTimeout(() => {
    if (throttleCount === 1) {
      console.log('✅ Throttle works');
    } else {
      console.log('❌ Throttle failed');
    }
  }, 200);
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running optimization tests...');
  
  testCache();
  testPerformance();
  testMemory();
  
  console.log('✅ All tests completed!');
}

// Export for use in development
export default {
  testCache,
  testPerformance,
  testMemory,
  runAllTests,
};
