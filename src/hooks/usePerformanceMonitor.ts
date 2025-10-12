import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
}

/**
 * Hook to monitor component performance in development
 */
export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    return () => {
      if (process.env.NODE_ENV === 'development') {
        const unmountTime = performance.now();
        const lifetimeMs = unmountTime - mountTimeRef.current;
        console.log(`📊 ${componentName} lifetime: ${lifetimeMs.toFixed(2)}ms, renders: ${renderCountRef.current}`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderCountRef.current++;
    
    if (process.env.NODE_ENV === 'development') {
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        if (renderTime > 16) {
          console.warn(`⚠️ ${componentName} render #${renderCountRef.current} took ${renderTime.toFixed(2)}ms (>16ms)`);
        }
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
  };
};

/**
 * Hook to track async operation latency
 */
export const useLatencyTracker = () => {
  const trackLatency = (operationName: string, startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      if (latency > 1000) {
        console.warn(`🐌 ${operationName} took ${latency.toFixed(2)}ms`);
      } else {
        console.log(`⚡ ${operationName} completed in ${latency.toFixed(2)}ms`);
      }
    }
  };

  return { trackLatency };
};
