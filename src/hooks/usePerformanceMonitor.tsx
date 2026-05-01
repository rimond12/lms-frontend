"use client";

import { useEffect, useState } from 'react';

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    renderTime: 0,
    apiCalls: 0,
  });

  useEffect(() => {
    // Monitor memory usage
    const updateMemoryUsage = () => {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memInfo.usedJSHeapSize / 1024 / 1024), // MB
        }));
      }
    };

    // Update memory usage periodically
    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Memory cleanup utility
export function cleanupMemory() {
  // Force garbage collection if available
  if (typeof window !== 'undefined' && 'gc' in window) {
    (window as any).gc();
  }

  // Clear any cached data that's no longer needed
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old-cache')) {
          caches.delete(name);
        }
      });
    });
  }
}

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// Performance monitoring component
export function PerformanceMonitor() {
  const metrics = usePerformanceMonitor();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>API Calls: {metrics.apiCalls}</div>
      <button
        onClick={cleanupMemory}
        className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
      >
        Cleanup
      </button>
    </div>
  );
}