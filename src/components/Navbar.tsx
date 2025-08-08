import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Heart, Mail, Film, CheckSquare, Music, Calendar, Camera, LogOut, 
  ChevronDown, Menu, X, MessageSquare, Home, Bookmark, User, Settings
} from 'lucide-react';

interface ProfileData {
  displayName?: string;
  profileImage?: string;
  favoriteEmoji?: string;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  emoji: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  emoji: string;
  items: NavItem[];
}

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      if (!currentUser) return;
      const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
      if (profileDoc.exists()) {
        setProfileData(profileDoc.data() as ProfileData);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Profil verisi yüklenirken hata:', error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser, fetchProfileData]);

  // Scroll lock for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navCategories: NavCategory[] = [
    {
      id: 'main',
      label: 'Ana Sayfa',
      icon: Home,
      emoji: '🏠',
      items: [
        { path: '/', icon: Heart, label: 'Ana Sayfa', emoji: '🏠' }
      ]
    },
    {
      id: 'communication',
      label: 'İletişim',
      icon: MessageSquare,
      emoji: '💬',
      items: [
        { path: '/letters', icon: Mail, label: 'Mektuplar', emoji: '💌' },
        { path: '/chat', icon: MessageSquare, label: 'Sohbet', emoji: '💬' }
      ]
    },
    {
      id: 'entertainment',
      label: 'Eğlence',
      icon: Film,
      emoji: '🎬',
      items: [
        { path: '/movies', icon: Film, label: 'Filmler', emoji: '🎬' },
        { path: '/music', icon: Music, label: 'Müzik', emoji: '🎵' }
      ]
    },
    {
      id: 'organization',
      label: 'Düzenleme',
      icon: CheckSquare,
      emoji: '📝',
      items: [
        { path: '/todos', icon: CheckSquare, label: 'Yapılacaklar', emoji: '📝' },
        { path: '/calendar', icon: Calendar, label: 'Takvim', emoji: '📅' }
      ]
    },
    {
      id: 'memories',
      label: 'Anılar',
      icon: Bookmark,
      emoji: '📷',
      items: [
        { path: '/gallery', icon: Camera, label: 'Galeri', emoji: '��' }
      ]
    },
    {
      id: 'account',
      label: 'Hesap',
      icon: User,
      emoji: '👤',
      items: [
        { path: '/profile', icon: User, label: 'Profilim', emoji: '👤' },
        { path: '/settings', icon: Settings, label: 'Ayarlar', emoji: '⚙️' }
      ]
    }
  ];

  const currentCategory = navCategories.find(category => 
    category.items.some(item => item.path === location.pathname)
  );

  const getDisplayName = () => {
    return profileData?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';
  };

  const getProfileImage = () => {
    if (profileData?.profileImage) {
      return <img src={profileData.profileImage} alt="Profile" className="w-full h-full object-cover" />;
    }
    if (profileData?.favoriteEmoji) {
      return <span className="text-lg">{profileData.favoriteEmoji}</span>;
    }
    return <span className="text-lg">😺</span>;
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    setExpandedCategory(null);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setExpandedCategory(null);
  };

  const handleCategoryClick = (category: NavCategory) => {
    if (category.items.length === 1) {
      navigate(category.items[0].path);
      closeMobileMenu();
    } else {
      setExpandedCategory(expandedCategory === category.id ? null : category.id);
    }
  };

  const handleNavItemClick = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <>
      <nav 
        className="sticky top-0 w-full backdrop-blur-md border-b z-40"
        style={{
          backgroundColor: colors.surface + '90',
          borderColor: colors.border
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-colors group"
              style={{ color: colors.text }}
            >
              <span className={`text-2xl ${
                currentTheme.animations.custom?.wiggle ? 'group-hover:animate-wiggle' : ''
              }`}>
                {currentTheme.emoji}
              </span>
              <div className="hidden sm:block">
                <div 
                  className="text-xl font-bold"
                  style={{ 
                    fontFamily: currentTheme.typography.fontFamilyHeading,
                    color: colors.text 
                  }}
                >
                  MindLine
                </div>
                <div 
                  className="text-xs"
                  style={{ 
                    color: colors.textSecondary,
                    fontFamily: currentTheme.typography.fontFamily
                  }}
                >
                  {currentTheme.id === 'skull-bunny' ? 'Gothic Romance' :
                   currentTheme.id === 'ocean' ? 'Okyanus Dünyası' :
                   'Kedili Aşk Dünyası'}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {navCategories.map((category) => (
                <div key={category.id} className="relative group">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 text-sm group ${
                      currentTheme.animations.custom?.flicker && currentTheme.id === 'skull-bunny' ? 'hover:animate-flicker' : ''
                    }`}
                    style={{
                      color: colors.text,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surface + '50';
                      e.currentTarget.style.color = colors.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.text;
                    }}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="hidden xl:block font-medium">{category.label}</span>
                    <span className="text-base">{category.emoji}</span>
                    {category.items.length > 1 && (
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    )}
                  </button>

                  {/* Desktop Dropdown */}
                  {category.items.length > 1 && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-48 backdrop-blur-xl rounded-2xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                      style={{
                        backgroundColor: colors.surface + '95',
                        borderColor: colors.border + '40',
                        boxShadow: `0 10px 40px ${colors.shadow}20`
                      }}
                    >
                      <div className="p-2">
                        {category.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm group"
                            style={{
                              color: colors.text,
                              // '--hover-bg': colors.surfaceVariant,
                              // '--hover-color': colors.primary
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.surfaceVariant;
                              e.currentTarget.style.color = colors.primary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = colors.text;
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.label}</span>
                            <span className="text-base">{item.emoji}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Profile & Actions */}
            <div className="flex items-center space-x-3">
              {/* Profile Button */}
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1 rounded-full border transition-all group"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface + '70'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surfaceVariant;
                  e.currentTarget.style.borderColor = colors.borderLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surface + '70';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border flex-shrink-0"
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.borderLight
                  }}
                >
                  {getProfileImage()}
                </div>
                
                <div className="hidden sm:flex flex-col">
                  <span 
                    className="text-sm font-medium max-w-20 truncate"
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {getDisplayName()}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ 
                      color: colors.textSecondary,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    Hoşgeldin
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 border rounded-full transition-all duration-200 text-sm group"
                style={{
                  color: colors.textSecondary,
                  borderColor: colors.border
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.error + '40';
                  e.currentTarget.style.color = colors.error;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:block font-medium">Çıkış</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                type="button"
                className="lg:hidden p-2 border rounded-full transition-all duration-200"
                style={{
                  color: colors.textSecondary,
                  borderColor: colors.border,
                  // '--hover-bg': colors.surfaceVariant,
                  // '--hover-border': colors.borderLight,
                  // '--hover-color': colors.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surfaceVariant;
                  e.currentTarget.style.borderColor = colors.borderLight;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
                onClick={openMobileMenu}
                aria-label="Menüyü aç"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu Panel */}
          <div 
            ref={mobileMenuRef}
            className="absolute inset-x-0 top-0 bottom-0 backdrop-blur-xl transform transition-transform duration-300 ease-out animate-in slide-in-from-top"
            style={{
              backgroundColor: colors.surface + '95'
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface + '50'
              }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentTheme.emoji}</span>
                <div>
                  <div 
                    className="text-lg font-bold"
                    style={{ 
                      fontFamily: currentTheme.typography.fontFamilyHeading,
                      color: colors.text 
                    }}
                  >
                    MindLine
                  </div>
                  <div 
                    className="text-xs"
                    style={{ 
                      color: colors.textSecondary,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    Menü
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="p-2 rounded-full transition-colors"
                style={{
                  color: colors.textSecondary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.surfaceVariant;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.textSecondary;
                }}
                aria-label="Menüyü kapat"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* User Info */}
                <div 
                  className="flex items-center space-x-3 p-4 rounded-2xl border mb-6"
                  style={{
                    background: colors.primaryGradient + '20',
                    borderColor: colors.border
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.borderLight
                    }}
                  >
                    {getProfileImage()}
                  </div>
                  <div>
                    <div 
                      className="text-base font-semibold"
                      style={{
                        color: colors.text,
                        fontFamily: currentTheme.typography.fontFamilyHeading
                      }}
                    >
                      {getDisplayName()}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ 
                        color: colors.textSecondary,
                        fontFamily: currentTheme.typography.fontFamily
                      }}
                    >
                      {currentUser?.email}
                    </div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {navCategories.map((category) => (
                    <div key={category.id} className="mb-2">
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                          currentCategory?.id === category.id
                            ? 'border'
                            : ''
                        }`}
                        style={{
                          color: currentCategory?.id === category.id ? colors.primary : colors.text,
                          backgroundColor: currentCategory?.id === category.id ? colors.surfaceVariant : 'transparent',
                          borderColor: currentCategory?.id === category.id ? colors.borderLight : 'transparent',
                          fontFamily: currentTheme.typography.fontFamily
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <category.icon className="w-5 h-5" />
                          <span className="font-medium">{category.label}</span>
                          <span className="text-lg">{category.emoji}</span>
                        </div>
                        {category.items.length > 1 && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                            expandedCategory === category.id ? 'rotate-180' : ''
                          }`} />
                        )}
                      </button>

                      {/* Submenu */}
                      {category.items.length > 1 && expandedCategory === category.id && (
                        <div className="mt-2 ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                          {category.items.map((item) => (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() => handleNavItemClick(item.path)}
                              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                                location.pathname === item.path ? 'border' : ''
                              }`}
                              style={{
                                color: location.pathname === item.path ? colors.primary : colors.textSecondary,
                                backgroundColor: location.pathname === item.path ? colors.surfaceVariant : 'transparent',
                                borderColor: location.pathname === item.path ? colors.borderLight : 'transparent',
                                fontFamily: currentTheme.typography.fontFamily
                              }}
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="font-medium">{item.label}</span>
                              <span className="text-base">{item.emoji}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Logout Button */}
                <div 
                  className="mt-8 pt-6 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200"
                    style={{
                      color: colors.error,
                      backgroundColor: 'transparent',
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.error + '10';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
