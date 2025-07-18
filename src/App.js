import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ParticleEffect from './components/ParticleEffect';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Letters from './pages/Letters';
import Movies from './pages/Movies';
import Todos from './pages/Todos';
import Music from './pages/Music';
import Calendar from './pages/Calendar';
import Gallery from './pages/Gallery';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-sunset-gradient font-elegant relative">
          <ParticleEffect />
          
          <Toaster 
            position="top-center"
            toastOptions={{
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
              }
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-2 py-6 relative z-10">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/letters" element={<Letters />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/todos" element={<Todos />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/gallery" element={<Gallery />} />
                  </Routes>
                </main>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
