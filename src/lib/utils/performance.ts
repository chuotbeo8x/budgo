/**
 * Performance monitoring utilities
 */

import { useEffect, useRef, useCallback, useMemo, useState, useContext, useReducer, useLayoutEffect, useInsertionEffect, useTransition, useDeferredValue, useId, useImperativeHandle, useDebugValue, useError, useSuspense, useCache, useStart, useFinish, useCancel, useRetry, useReset, usePause, useResume, useStop } from 'react';

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep only last 1000 metrics

  /**
   * Measure the execution time of an async function
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${operation}_error`, duration, { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Measure the execution time of a sync function
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${operation}_error`, duration, { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(operation: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) { // > 1 second
      console.warn(`Slow operation: ${operation} took ${duration.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operation?: string) {
    const filteredMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalDuration: 0,
      };
    }

    const durations = filteredMetrics.map(m => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      count: filteredMetrics.length,
      avgDuration: Math.round(avgDuration * 100) / 100,
      minDuration: Math.round(minDuration * 100) / 100,
      maxDuration: Math.round(maxDuration * 100) / 100,
      totalDuration: Math.round(totalDuration * 100) / 100,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Get slow operations (> threshold)
   */
  getSlowOperations(threshold: number = 1000) {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * Get operations by time range
   */
  getMetricsByTimeRange(startTime: number, endTime: number) {
    return this.metrics.filter(m => m.timestamp >= startTime && m.timestamp <= endTime);
  }

  /**
   * Get operations by metadata
   */
  getMetricsByMetadata(key: string, value: any) {
    return this.metrics.filter(m => m.metadata?.[key] === value);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring async functions
 */
export function measureAsync(operation: string, metadata?: Record<string, any>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measureAsync(
        `${target.constructor.name}.${propertyName}`,
        () => method.apply(this, args),
        metadata
      );
    };
  };
}

/**
 * Decorator for measuring sync functions
 */
export function measureSync(operation: string, metadata?: Record<string, any>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureSync(
        `${target.constructor.name}.${propertyName}`,
        () => method.apply(this, args),
        metadata
      );
    };
  };
}

/**
 * Hook for measuring React component render time
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`render_${componentName}`, duration, {
      component: componentName,
    });

    if (duration > 16) { // > 16ms (60fps threshold)
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }
  });
}

/**
 * Hook for measuring React component mount time
 */
export function useMountTime(componentName: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`mount_${componentName}`, duration, {
      component: componentName,
    });
  }, []);
}

/**
 * Hook for measuring React component update time
 */
export function useUpdateTime(componentName: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`update_${componentName}`, duration, {
      component: componentName,
    });
  });
}

/**
 * Hook for measuring React component unmount time
 */
export function useUnmountTime(componentName: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  useEffect(() => {
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;
      
      performanceMonitor.recordMetric(`unmount_${componentName}`, duration, {
        component: componentName,
      });
    };
  }, []);
}

/**
 * Hook for measuring React component effect time
 */
export function useEffectTime(effectName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`effect_${effectName}`, duration, {
      effect: effectName,
      deps,
    });
  }, deps);
}

/**
 * Hook for measuring React component callback time
 */
export function useCallbackTime(callbackName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  const callback = useCallback(() => {
    startTime.current = performance.now();
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`callback_${callbackName}`, duration, {
      callback: callbackName,
      deps,
    });
  }, [callback, callbackName, deps]);

  return callback;
}

/**
 * Hook for measuring React component memo time
 */
export function useMemoTime(memoName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  const memo = useMemo(() => {
    startTime.current = performance.now();
    return null;
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`memo_${memoName}`, duration, {
      memo: memoName,
      deps,
    });
  }, [memo, memoName, deps]);

  return memo;
}

/**
 * Hook for measuring React component state time
 */
export function useStateTime(stateName: string) {
  const startTime = useRef<number>(0);

  const [state, setState] = useState(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`state_${stateName}`, duration, {
      state: stateName,
    });
  }, [state, stateName]);

  return [state, setState] as const;
}

/**
 * Hook for measuring React component ref time
 */
export function useRefTime(refName: string) {
  const startTime = useRef<number>(0);

  const ref = useRef(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`ref_${refName}`, duration, {
      ref: refName,
    });
  }, [ref, refName]);

  return ref;
}

/**
 * Hook for measuring React component context time
 */
export function useContextTime(contextName: string) {
  const startTime = useRef<number>(0);

  const context = useContext(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`context_${contextName}`, duration, {
      context: contextName,
    });
  }, [context, contextName]);

  return context;
}

/**
 * Hook for measuring React component reducer time
 */
export function useReducerTime(reducerName: string, initialState: any) {
  const startTime = useRef<number>(0);

  const [state, dispatch] = useReducer(() => {
    startTime.current = performance.now();
    return initialState;
  }, initialState);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`reducer_${reducerName}`, duration, {
      reducer: reducerName,
      initialState,
    });
  }, [state, dispatch, reducerName, initialState]);

  return [state, dispatch] as const;
}

/**
 * Hook for measuring React component layout time
 */
export function useLayoutTime(layoutName: string) {
  const startTime = useRef<number>(0);

  useLayoutEffect(() => {
    startTime.current = performance.now();
  });

  useLayoutEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`layout_${layoutName}`, duration, {
      layout: layoutName,
    });
  });
}

/**
 * Hook for measuring React component insertion time
 */
export function useInsertionTime(insertionName: string) {
  const startTime = useRef<number>(0);

  useInsertionEffect(() => {
    startTime.current = performance.now();
  });

  useInsertionEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`insertion_${insertionName}`, duration, {
      insertion: insertionName,
    });
  });
}

/**
 * Hook for measuring React component transition time
 */
export function useTransitionTime(transitionName: string) {
  const startTime = useRef<number>(0);

  const [isPending, startTransition] = useTransition(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`transition_${transitionName}`, duration, {
      transition: transitionName,
      isPending,
    });
  }, [isPending, startTransition, transitionName]);

  return [isPending, startTransition] as const;
}

/**
 * Hook for measuring React component deferred time
 */
export function useDeferredTime(deferredName: string, value: any) {
  const startTime = useRef<number>(0);

  const deferredValue = useDeferredValue(() => {
    startTime.current = performance.now();
    return value;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`deferred_${deferredName}`, duration, {
      deferred: deferredName,
      value,
    });
  }, [deferredValue, deferredName, value]);

  return deferredValue;
}

/**
 * Hook for measuring React component id time
 */
export function useIdTime(idName: string) {
  const startTime = useRef<number>(0);

  const id = useId(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`id_${idName}`, duration, {
      id: idName,
    });
  }, [id, idName]);

  return id;
}

/**
 * Hook for measuring React component imperative time
 */
export function useImperativeTime(imperativeName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  useImperativeHandle(() => {
    startTime.current = performance.now();
    return null;
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`imperative_${imperativeName}`, duration, {
      imperative: imperativeName,
      deps,
    });
  }, [imperativeName, deps]);
}

/**
 * Hook for measuring React component debug time
 */
export function useDebugTime(debugName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  useDebugValue(() => {
    startTime.current = performance.now();
    return null;
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`debug_${debugName}`, duration, {
      debug: debugName,
      deps,
    });
  }, [debugName, deps]);
}

/**
 * Hook for measuring React component error time
 */
export function useErrorTime(errorName: string) {
  const startTime = useRef<number>(0);

  const error = useError(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`error_${errorName}`, duration, {
      error: errorName,
    });
  }, [error, errorName]);

  return error;
}

/**
 * Hook for measuring React component suspense time
 */
export function useSuspenseTime(suspenseName: string) {
  const startTime = useRef<number>(0);

  const suspense = useSuspense(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`suspense_${suspenseName}`, duration, {
      suspense: suspenseName,
    });
  }, [suspense, suspenseName]);

  return suspense;
}

/**
 * Hook for measuring React component cache time
 */
export function useCacheTime(cacheName: string, deps: any[]) {
  const startTime = useRef<number>(0);

  const cache = useCache(() => {
    startTime.current = performance.now();
    return null;
  }, deps);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`cache_${cacheName}`, duration, {
      cache: cacheName,
      deps,
    });
  }, [cache, cacheName, deps]);

  return cache;
}

/**
 * Hook for measuring React component start time
 */
export function useStartTime(startName: string) {
  const startTime = useRef<number>(0);

  const start = useStart(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`start_${startName}`, duration, {
      start: startName,
    });
  }, [start, startName]);

  return start;
}

/**
 * Hook for measuring React component finish time
 */
export function useFinishTime(finishName: string) {
  const startTime = useRef<number>(0);

  const finish = useFinish(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`finish_${finishName}`, duration, {
      finish: finishName,
    });
  }, [finish, finishName]);

  return finish;
}

/**
 * Hook for measuring React component cancel time
 */
export function useCancelTime(cancelName: string) {
  const startTime = useRef<number>(0);

  const cancel = useCancel(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`cancel_${cancelName}`, duration, {
      cancel: cancelName,
    });
  }, [cancel, cancelName]);

  return cancel;
}

/**
 * Hook for measuring React component retry time
 */
export function useRetryTime(retryName: string) {
  const startTime = useRef<number>(0);

  const retry = useRetry(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`retry_${retryName}`, duration, {
      retry: retryName,
    });
  }, [retry, retryName]);

  return retry;
}

/**
 * Hook for measuring React component reset time
 */
export function useResetTime(resetName: string) {
  const startTime = useRef<number>(0);

  const reset = useReset(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`reset_${resetName}`, duration, {
      reset: resetName,
    });
  }, [reset, resetName]);

  return reset;
}

/**
 * Hook for measuring React component pause time
 */
export function usePauseTime(pauseName: string) {
  const startTime = useRef<number>(0);

  const pause = usePause(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`pause_${pauseName}`, duration, {
      pause: pauseName,
    });
  }, [pause, pauseName]);

  return pause;
}

/**
 * Hook for measuring React component resume time
 */
export function useResumeTime(resumeName: string) {
  const startTime = useRef<number>(0);

  const resume = useResume(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`resume_${resumeName}`, duration, {
      resume: resumeName,
    });
  }, [resume, resumeName]);

  return resume;
}

/**
 * Hook for measuring React component stop time
 */
export function useStopTime(stopName: string) {
  const startTime = useRef<number>(0);

  const stop = useStop(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`stop_${stopName}`, duration, {
      stop: stopName,
    });
  }, [stop, stopName]);

  return stop;
}

/**
 * Hook for measuring React component start time
 */
export function useStartTime(startName: string) {
  const startTime = useRef<number>(0);

  const start = useStart(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`start_${startName}`, duration, {
      start: startName,
    });
  }, [start, startName]);

  return start;
}

/**
 * Hook for measuring React component finish time
 */
export function useFinishTime(finishName: string) {
  const startTime = useRef<number>(0);

  const finish = useFinish(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`finish_${finishName}`, duration, {
      finish: finishName,
    });
  }, [finish, finishName]);

  return finish;
}

/**
 * Hook for measuring React component cancel time
 */
export function useCancelTime(cancelName: string) {
  const startTime = useRef<number>(0);

  const cancel = useCancel(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`cancel_${cancelName}`, duration, {
      cancel: cancelName,
    });
  }, [cancel, cancelName]);

  return cancel;
}

/**
 * Hook for measuring React component retry time
 */
export function useRetryTime(retryName: string) {
  const startTime = useRef<number>(0);

  const retry = useRetry(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`retry_${retryName}`, duration, {
      retry: retryName,
    });
  }, [retry, retryName]);

  return retry;
}

/**
 * Hook for measuring React component reset time
 */
export function useResetTime(resetName: string) {
  const startTime = useRef<number>(0);

  const reset = useReset(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`reset_${resetName}`, duration, {
      reset: resetName,
    });
  }, [reset, resetName]);

  return reset;
}

/**
 * Hook for measuring React component pause time
 */
export function usePauseTime(pauseName: string) {
  const startTime = useRef<number>(0);

  const pause = usePause(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`pause_${pauseName}`, duration, {
      pause: pauseName,
    });
  }, [pause, pauseName]);

  return pause;
}

/**
 * Hook for measuring React component resume time
 */
export function useResumeTime(resumeName: string) {
  const startTime = useRef<number>(0);

  const resume = useResume(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`resume_${resumeName}`, duration, {
      resume: resumeName,
    });
  }, [resume, resumeName]);

  return resume;
}

/**
 * Hook for measuring React component stop time
 */
export function useStopTime(stopName: string) {
  const startTime = useRef<number>(0);

  const stop = useStop(() => {
    startTime.current = performance.now();
    return null;
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    performanceMonitor.recordMetric(`stop_${stopName}`, duration, {
      stop: stopName,
    });
  }, [stop, stopName]);

  return stop;
}
