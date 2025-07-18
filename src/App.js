import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
        <div className="min-h-screen bg-futuristic-gradient font-futuristic">
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#f6f8fa',
                color: '#24292f',
                border: '1px solid #cbd5e1'
              }
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <main className="container mx-auto px-2 py-6">
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
