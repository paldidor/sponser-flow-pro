/**
 * Performance monitoring utilities for the marketplace
 */

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string, startTime: number) => {
  if (process.env.NODE_ENV === 'development') {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 16) { // Longer than one frame (60fps)
      console.warn(`⚠️ ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  }
};

/**
 * Debounce function for expensive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if reduced motion is preferred
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (
  img: HTMLImageElement,
  src: string,
  callback?: () => void
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.onload = () => {
            img.classList.add('loaded');
            callback?.();
          };
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px',
    }
  );

  observer.observe(img);
  return () => observer.disconnect();
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Batch DOM reads to avoid layout thrashing
 */
export const batchRead = (callback: () => void) => {
  requestAnimationFrame(callback);
};

/**
 * Batch DOM writes to avoid layout thrashing
 */
export const batchWrite = (callback: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

/**
 * Measure First Contentful Paint
 */
export const measureFCP = () => {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log(`FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Ignore if not supported
    }
  }
};

/**
 * Check if user is on a slow connection
 */
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return (
    connection.saveData ||
    /2g/.test(connection.effectiveType)
  );
};
