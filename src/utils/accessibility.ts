// Accessibility utilities and helpers

/**
 * Screen reader only text component utility
 */
export const srOnlyStyles = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

/**
 * Focus visible styles
 */
export const focusVisibleStyles = `
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
`;

/**
 * Generate unique ID for form elements
 */
export const generateId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Manage focus for modals and overlays
 */
export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;
  private focusableElements: HTMLElement[] = [];

  constructor(private container: HTMLElement) {
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(selectors)
    ) as HTMLElement[];
  }

  trapFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();

    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  restoreFocus(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    }
  };
}

/**
 * Check if element is visible to screen readers
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
};

/**
 * Get accessible name for an element
 */
export const getAccessibleName = (element: HTMLElement): string => {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label for form elements
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.getAttribute('id');
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || '';
    }
  }

  // Check title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  // Check placeholder for form elements
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;
  }

  // Fall back to text content
  return element.textContent || '';
};

/**
 * Check color contrast ratio
 */
export const getContrastRatio = (foreground: string, background: string): number => {
  // This is a simplified version. In production, you'd want a more robust implementation
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const getRGB = (color: number): number => {
      return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 */
export const meetsContrastRequirement = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

/**
 * Keyboard navigation helpers
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    elements: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ): number => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          newIndex = (currentIndex + 1) % elements.length;
          event.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical') {
          newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          newIndex = (currentIndex + 1) % elements.length;
          event.preventDefault();
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
          event.preventDefault();
        }
        break;
      case 'Home':
        newIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newIndex = elements.length - 1;
        event.preventDefault();
        break;
    }

    if (newIndex !== currentIndex) {
      elements[newIndex]?.focus();
    }

    return newIndex;
  },

  /**
   * Handle Enter and Space key activation
   */
  handleActivation: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * Reduce motion preferences
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * High contrast mode detection
 */
export const prefersHighContrast = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * ARIA helpers
 */
export const aria = {
  /**
   * Set ARIA attributes on element
   */
  setAttributes: (element: HTMLElement, attributes: Record<string, string | boolean | null>): void => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === null) {
        element.removeAttribute(`aria-${key}`);
      } else {
        element.setAttribute(`aria-${key}`, String(value));
      }
    });
  },

  /**
   * Announce loading state
   */
  announceLoading: (isLoading: boolean, message: string = 'Yükleniyor...'): void => {
    if (isLoading) {
      announceToScreenReader(message);
    }
  },

  /**
   * Announce error
   */
  announceError: (error: string): void => {
    announceToScreenReader(`Hata: ${error}`, 'assertive');
  },

  /**
   * Announce success
   */
  announceSuccess: (message: string): void => {
    announceToScreenReader(message, 'polite');
  }
};

/**
 * Skip link helper
 */
export const createSkipLink = (targetId: string, text: string = 'Ana içeriğe geç'): HTMLAnchorElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:z-[9999]';
  skipLink.textContent = text;
  
  return skipLink;
};

/**
 * Form validation announcement
 */
export const announceFormValidation = (errors: Record<string, string>): void => {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount > 0) {
    const message = errorCount === 1 
      ? '1 hata bulundu. Lütfen formu kontrol edin.'
      : `${errorCount} hata bulundu. Lütfen formu kontrol edin.`;
    
    announceToScreenReader(message, 'assertive');
  }
};

/**
 * Live region manager
 */
export class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  private constructor() {
    this.politeRegion = this.createRegion('polite');
    this.assertiveRegion = this.createRegion('assertive');
  }

  static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }

  private createRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.setAttribute('id', `live-region-${priority}`);
    
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    // Clear and set new message
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 2000);
  }
}

export default {
  srOnlyStyles,
  focusVisibleStyles,
  generateId,
  announceToScreenReader,
  FocusManager,
  isElementVisible,
  getAccessibleName,
  getContrastRatio,
  meetsContrastRequirement,
  keyboardNavigation,
  prefersReducedMotion,
  prefersHighContrast,
  aria,
  createSkipLink,
  announceFormValidation,
  LiveRegionManager
};
