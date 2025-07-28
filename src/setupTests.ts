// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./firebase', () => ({
  auth: {},
  db: {},
  ALLOWED_EMAILS: ['test@example.com']
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    fromDate: jest.fn(),
    now: jest.fn()
  }
}));

// Mock Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {}
  observe(target: Element, options?: ResizeObserverOptions): void {}
  unobserve(target: Element): void {}
  disconnect(): void {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  private params: Map<string, string> = new Map();
  
  constructor(init?: string | string[][] | Record<string, string> | URLSearchParams) {
    if (typeof init === 'string') {
      // Simple implementation for testing
      const pairs = init.replace(/^\?/, '').split('&');
      pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        }
      });
    }
  }
  
  append(name: string, value: string): void {
    this.params.set(name, value);
  }
  
  delete(name: string): void {
    this.params.delete(name);
  }
  
  get(name: string): string | null {
    return this.params.get(name);
  }
  
  has(name: string): boolean {
    return this.params.has(name);
  }
  
  set(name: string, value: string): void {
    this.params.set(name, value);
  }
  
  toString(): string {
    const pairs: string[] = [];
    this.params.forEach((value, key) => {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    return pairs.join('&');
  }
  
  *[Symbol.iterator](): Iterator<[string, string]> {
    yield* this.params;
  }
};

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  // Suppress known warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('Warning: componentWillReceiveProps') ||
     args[0].includes('Warning: componentWillMount'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  // Suppress known warnings in tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: React.createFactory') ||
     args[0].includes('Warning: componentWillReceiveProps'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Add custom matchers
expect.extend({
  toHaveAccessibleName(received, expected) {
    const pass = received.getAttribute('aria-label') === expected ||
                 received.getAttribute('aria-labelledby') === expected ||
                 received.textContent === expected;
    
    if (pass) {
      return {
        message: () => `expected element not to have accessible name "${expected}"`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to have accessible name "${expected}"`,
        pass: false,
      };
    }
  },
});

// Global test helpers
global.testUtils = {
  // Helper to wait for async operations
  waitForAsync: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Helper to create mock events
  createMockEvent: (type: string, properties: any = {}) => ({
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...properties
  }),
  
  // Helper to mock timers
  mockTimers: () => {
    jest.useFakeTimers();
    return () => jest.useRealTimers();
  }
};

// Setup for testing environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Reset any DOM event listeners
  document.removeEventListener = jest.fn();
  document.addEventListener = jest.fn();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});

// Export for use in tests
export {};
