import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import ParticleEffect from './components/ParticleEffect';
import Navbar from './components/Navbar';
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
const PageLoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
    <div className="relative">
      <div className="text-8xl animate-bounce-cat">😺</div>
      <div className="absolute -top-4 -right-4 text-3xl animate-float">✨</div>
    </div>
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-pink-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
    <p className="text-gray-700 font-cat text-xl">Kedili sayfa yükleniyor...</p>
  </div>
);

// Toast configuration
const toastConfig = {
  position: 'top-center' as const,
  duration: 4000,
  style: {
    background: 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 100%)',
    color: '#374151',
    border: '2px solid #f8b668',
    borderRadius: '1rem',
    boxShadow: '0 4px 25px rgba(242, 113, 28, 0.2)',
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
        <Router>
          <div className="min-h-screen bg-pink-gradient font-elegant relative">
            {/* Background decorations */}
            <div className="background-decorations" />
            
            {/* Particle effects */}
            <ParticleEffect />
            
            {/* Toast notifications */}
            <Toaster toastOptions={toastConfig} />
            
            {/* Routes */}
            <Suspense fallback={<PageLoadingSpinner />}>
              <Routes>
                {/* Public route */}
                <Route 
                  path="/login" 
                  element={<Login />} 
                />
                
                {/* Protected routes */}
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <main className="container mx-auto px-2 py-6 relative z-10">
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
                                    <div className="text-8xl mb-6">😿</div>
                                    <h2 className="text-3xl font-cat text-gray-800 mb-4">
                                      Sayfa Bulunamadı
                                    </h2>
                                    <p className="text-gray-600 font-elegant">
                                      Aradığınız kedili sayfa mevcut değil.
                                    </p>
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
        </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
