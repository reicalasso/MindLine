/**
 * Performance optimization utilities
 */

// Check if device supports backdrop-filter
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const testElement = document.createElement('div');
  testElement.style.backdropFilter = 'blur(1px)';
  (testElement.style as any).webkitBackdropFilter = 'blur(1px)';
  
  return !!(testElement.style.backdropFilter || (testElement.style as any).webkitBackdropFilter);
};

// Check if device prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Check if device is low-end (basic heuristic)
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  
  // Basic detection based on hardware concurrency and memory
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2;
  
  return cores <= 2 && memory <= 2;
};

// Get optimized backdrop filter based on device capabilities
export const getOptimizedBackdropFilter = (blur: number = 8): string => {
  if (prefersReducedMotion() || isLowEndDevice()) {
    return 'none';
  }
  
  if (!supportsBackdropFilter()) {
    return 'none';
  }
  
  // Reduce blur on mobile for better performance
  const isMobile = window.innerWidth <= 768;
  const optimizedBlur = isMobile ? Math.min(blur, 4) : blur;
  
  return `blur(${optimizedBlur}px) saturate(150%)`;
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Request animation frame utility
export const rafSchedule = (callback: () => void): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

export const performanceUtils = {
  supportsBackdropFilter,
  prefersReducedMotion,
  isLowEndDevice,
  getOptimizedBackdropFilter,
  debounce,
  throttle,
  rafSchedule
};

export default performanceUtils;
