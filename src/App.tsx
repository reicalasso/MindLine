import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ParticleEffect from './components/ParticleEffect';
import CyberEffect from './components/CyberEffect';
import Navbar from './components/Navbar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import SearchModal from './components/SearchModal';
import { SearchResult } from './types';
import './index.css';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Letters = lazy(() => import('./pages/Letters'));
const Chat = lazy(() => import('./pages/Chat'));
const Movies = lazy(() => import('./pages/Movies'));
const Todos = lazy(() => import('./pages/Todos'));
const Music = lazy(() => import('./pages/Music'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading component
const PageLoadingSpinner: React.FC = () => {
  const { currentTheme } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <div className="relative">
        {currentTheme.id === 'cyberpunk' ? (
          <div className="relative animate-float">
            <div className="text-8xl animate-neon-flicker-extreme text-cyber-primary-extreme">⚡</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-glitch-extreme text-cyber-secondary-extreme">⚙️</div>
            <div className="cyber-scan-line-extreme"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="text-8xl animate-bounce-cat">😺</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-float">✨</div>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full animate-bounce ${
              currentTheme.id === 'cyberpunk' 
                ? 'bg-cyber-primary shadow-neon-blue' 
                : 'bg-pink-400'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className={`${currentTheme.id === 'cyberpunk' ? 'font-mono text-cyber-primary-extreme animate-neon-flicker-lite' : 'font-cat text-xl'} ${currentTheme.styles.textClass}`}>
        {currentTheme.id === 'cyberpunk' ? 'LOADING_SEQUENCE: ACTIVE' : 'Kedili sayfa yükleniyor...'}
      </p>
    </div>
  );
};

// Toast configuration component
const ToastConfig: React.FC = () => {
  const { currentTheme } = useTheme();
  
  const toastConfig = {
    position: 'top-center' as const,
    duration: 4000,
    style: {
      background: currentTheme.colors.background.includes('gradient') 
        ? 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 100%)'
        : currentTheme.colors.surface,
      color: currentTheme.colors.text,
      border: `2px solid ${currentTheme.colors.border}`,
      borderRadius: '1rem',
      boxShadow: currentTheme.colors.shadow === 'shadow-cat' 
        ? '0 4px 25px rgba(242, 113, 28, 0.2)' 
        : '0 4px 25px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Montserrat, sans-serif',
      fontSize: '14px',
      fontWeight: '500'
    },
    success: {
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
      style: {
        border: '2px solid #10b981',
      }
    },
    error: {
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
      style: {
        border: '2px solid #ef4444',
      }
    },
    loading: {
      iconTheme: {
        primary: '#3b82f6',
        secondary: '#ffffff',
      },
      style: {
        border: '2px solid #3b82f6',
      }
    }
  };

  return <Toaster toastOptions={toastConfig} />;
};

// App content component with keyboard shortcuts and search (inside Router)
const AppContentWithRouter: React.FC = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { 
    shortcuts, 
    isShortcutModalOpen, 
    closeShortcutModal 
  } = useKeyboardShortcuts();

  // Update the search shortcut to open the search modal
  const enhancedShortcuts = shortcuts.map(shortcut => {
    if (shortcut.key === 'k' && shortcut.ctrl) {
      return {
        ...shortcut,
        action: () => setIsSearchOpen(true)
      };
    }
    return shortcut;
  });

  const handleSearchResultNavigation = (result: SearchResult) => {
    // Navigate based on the result type
    switch (result.type) {
      case 'letter':
        navigate('/letters');
        break;
      case 'message':
        navigate('/chat');
        break;
      case 'photo':
        navigate('/gallery');
        break;
      case 'movie':
        navigate('/movies');
        break;
      case 'music':
        navigate('/music');
        break;
      case 'todo':
        navigate('/todos');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden max-w-[100vw]">
      <ToastConfig />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutModalOpen}
        onClose={closeShortcutModal}
        shortcuts={enhancedShortcuts}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToResult={handleSearchResultNavigation}
      />

      <Suspense fallback={<PageLoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                {/* Background effects */}
                <ParticleEffect />
                <CyberEffect />
                
                <Navbar onSearchClick={() => setIsSearchOpen(true)} />
                <main className="w-full overflow-x-hidden py-6 relative z-[100] px-2 md:container md:mx-auto">
                  <ErrorBoundary>
                    <Suspense fallback={<PageLoadingSpinner />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/letters" element={<Letters />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/movies" element={<Movies />} />
                        <Route path="/todos" element={<Todos />} />
                        <Route path="/music" element={<Music />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/profile" element={<Profile />} />
                        
                        {/* 404 route */}
                        <Route 
                          path="*" 
                          element={
                            <div className="text-center py-20">
                              {currentTheme.id === 'cyberpunk' ? (
                                <>
                                  <div className="text-8xl mb-6 animate-glitch-extreme text-cyber-secondary-extreme">⚠️</div>
                                  <h2 className="text-3xl font-mono mb-4 text-cyber-primary-extreme animate-neon-flicker-extreme">
                                    ERROR_404: PATH_NOT_FOUND
                                  </h2>
                                  <p className="font-mono text-cyber-secondary-extreme">
                                    SYSTEM_MESSAGE: REQUESTED_ROUTE_DOES_NOT_EXIST
                                  </p>
                                  <div className="mt-6 w-32 h-1 bg-cyber-primary mx-auto animate-circuit-pulse-extreme rounded-full"></div>
                                </>
                              ) : (
                                <>
                                  <div className="text-8xl mb-6">😿</div>
                                  <h2 className={`text-3xl font-cat mb-4 ${currentTheme.styles.textClass}`}>
                                    Sayfa Bulunamadı
                                  </h2>
                                  <p className={`font-elegant ${currentTheme.styles.textClass}`}>
                                    Aradığınız kedili sayfa mevcut değil.
                                  </p>
                                  <div className="mt-4">
                                    <button
                                      onClick={() => setIsSearchOpen(true)}
                                      className={`px-4 py-2 rounded-lg font-medium transition-all ${currentTheme.styles.buttonClass}`}
                                    >
                                      🔍 Arama Yap
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          } 
                        />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Suspense>
    </div>
  );
};

// App content component
const AppContent: React.FC = () => {  
  return (
    <AuthProvider>
      <Router>
        <AppContentWithRouter />
      </Router>
    </AuthProvider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
