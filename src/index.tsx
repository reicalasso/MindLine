import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { errorUtils } from './utils';

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Development'da performans metrikleri
  const logPerformance = () => {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      console.log('🚀 Performance Metrics:', {
        'DOM Content Loaded': `${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`,
        'Load Complete': `${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`,
        'Total Load Time': `${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`,
        'DNS Lookup': `${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`,
        'TCP Connection': `${Math.round(navigation.connectEnd - navigation.connectStart)}ms`,
        'Server Response': `${Math.round(navigation.responseEnd - navigation.responseStart)}ms`
      });
    }
  };

  // Page load tamamlandığında performans logla
  window.addEventListener('load', () => {
    setTimeout(logPerformance, 0);
  });
}

// Global error handler
window.addEventListener('error', (event) => {
  errorUtils.logError(event.error, 'Global Error Handler');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorUtils.logError(event.reason, 'Unhandled Promise Rejection');
  event.preventDefault(); // Prevent default browser behavior
});

// Web Vitals monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }).catch(() => {
    // web-vitals package not available, silently ignore
  });
}

// Root element
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Create root and render app
const root = createRoot(container);

// Render with error boundary
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    errorUtils.logError(error, 'App Render');
    
    // Fallback UI
    root.render(
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">😿</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Uygulama Başlatılamadı
          </h1>
          <p className="text-gray-600 mb-6">
            Kedili dünyamızda teknik bir sorun oluştu. Lütfen sayfayı yenileyin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
};

// Initialize app
renderApp();

// Hot module replacement support (development only)
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(
      <React.StrictMode>
        <NextApp />
      </React.StrictMode>
    );
  });
}

// Service worker registration (production only)
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
  // Skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
  skipLink.textContent = 'Ana içeriğe geç';
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Keyboard navigation improvements
  document.addEventListener('keydown', (event) => {
    // ESC key to close modals
    if (event.key === 'Escape') {
      const event_esc = new CustomEvent('escape-pressed');
      document.dispatchEvent(event_esc);
    }
  });
});

// Prevent zoom on iOS Safari double tap
document.addEventListener('dblclick', (event) => {
  event.preventDefault();
}, { passive: false });

// Prevent default touch behaviors that might interfere with app
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchmove', () => {}, { passive: true });

// Add custom CSS properties for dynamic theming
const setCustomProperties = () => {
  const root = document.documentElement;
  
  // System theme detection
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.style.setProperty('--is-dark-mode', isDark ? '1' : '0');
  
  // Viewport dimensions
  root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  root.style.setProperty('--vw', `${window.innerWidth * 0.01}px`);
};

// Initial setup
setCustomProperties();

// Update on resize and orientation change
window.addEventListener('resize', setCustomProperties);
window.addEventListener('orientationchange', setCustomProperties);

// Theme change detection
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setCustomProperties);

export {};
