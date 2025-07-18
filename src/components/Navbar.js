import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Heart, Mail, Film, CheckSquare, Music, Calendar, Camera, LogOut, 
  ChevronDown, Menu, X, MessageSquare, Home, Bookmark, Users
} from 'lucide-react';

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {}
  };

  // Sayfaları kategorilere göre organize ediyoruz
  const navCategories = [
    {
      id: 'main',
      label: 'Ana Sayfa',
      icon: Home,
      items: [
        { path: '/', icon: Heart, label: 'Ana Sayfa' }
      ]
    },
    {
      id: 'communication',
      label: 'İletişim',
      icon: MessageSquare,
      items: [
        { path: '/letters', icon: Mail, label: 'Mektuplar' }
      ]
    },
    {
      id: 'entertainment',
      label: 'Eğlence',
      icon: Film,
      items: [
        { path: '/movies', icon: Film, label: 'Filmler' },
        { path: '/music', icon: Music, label: 'Müzik' }
      ]
    },
    {
      id: 'productivity',
      label: 'Verimlilik',
      icon: CheckSquare,
      items: [
        { path: '/todos', icon: CheckSquare, label: 'Yapılacaklar' },
        { path: '/calendar', icon: Calendar, label: 'Takvim' }
      ]
    },
    {
      id: 'memories',
      label: 'Anılar',
      icon: Bookmark,
      items: [
        { path: '/gallery', icon: Camera, label: 'Galeri' }
      ]
    }
  ];

  // Şu anki sayfanın hangi kategoride olduğunu bulalım
  const currentCategory = navCategories.find(category => 
    category.items.some(item => item.path === location.pathname)
  );

  const toggleCategory = (categoryId) => {
    if (openCategory === categoryId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(categoryId);
    }
  };

  return (
    <nav className="bg-futuristic-gradient shadow-soft border-b border-futuristic-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">😺</span>
            <h1 className="text-xl font-futuristic text-futuristic-700">MindLine</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navCategories.map((category) => (
              <div key={category.id} className="relative group">
                <button 
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    currentCategory?.id === category.id 
                      ? 'bg-cat-100 text-cat-700' 
                      : 'text-futuristic-600 hover:bg-cat-50'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-futuristic-100 transition-all origin-top-left z-10 ${
                  openCategory === category.id ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                }`}>
                  <div className="py-1">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm ${
                          location.pathname === item.path
                            ? 'bg-cat-50 text-cat-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => setOpenCategory(null)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User and Logout */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-futuristic-600 hidden sm:block font-futuristic">
              {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-2 py-1 text-futuristic-600 hover:bg-cat-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Çıkış</span>
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-1 text-futuristic-600 hover:bg-cat-50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen py-2' : 'max-h-0'}`}>
          <div className="space-y-2">
            {navCategories.map((category) => (
              <div key={category.id} className="border-b border-futuristic-100 pb-2">
                <button 
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                    currentCategory?.id === category.id 
                      ? 'bg-cat-100 text-cat-700' 
                      : 'text-futuristic-600'
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-5 h-5" />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`mt-1 space-y-1 transition-all ${openCategory === category.id ? 'block' : 'hidden'}`}>
                  {category.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${
                        location.pathname === item.path
                          ? 'bg-cat-50 text-cat-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
