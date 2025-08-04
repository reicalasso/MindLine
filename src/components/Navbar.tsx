import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Heart, Mail, Film, CheckSquare, Music, Calendar, Camera, LogOut, 
  ChevronDown, Menu, X, MessageSquare, Home, Bookmark, User
} from 'lucide-react';

interface ProfileData {
  displayName?: string;
  profileImage?: string;
  favoriteEmoji?: string;
}

interface NavItem {
  path: string;
  icon: any;
  label: string;
  emoji: string;
}

interface NavCategory {
  id: string;
  label: string;
  icon: any;
  emoji: string;
  items: NavItem[];
}

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    }
  }, [currentUser]);

  const fetchProfileData = async () => {
    try {
      if (!currentUser) return;
      const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
      if (profileDoc.exists()) {
        setProfileData(profileDoc.data() as ProfileData);
      }
    } catch (error) {
      console.error('Profil verisi yüklenirken hata:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Cyberpunk tema için emoji'leri değiştir
  const getCyberEmoji = (originalEmoji: string) => {
    if (currentTheme.id !== 'cyberpunk') return originalEmoji;

    const cyberMap: Record<string, string> = {
      '🏠': '🏢',
      '💌': '📡',
      '💬': '💻',
      '🎬': '📱',
      '🎵': '🎚️',
      '📝': '⚡',
      '📅': '🔮',
      '📷': '💾',
      '👤': '🤖'
    };

    return cyberMap[originalEmoji] || originalEmoji;
  };

  const navCategories: NavCategory[] = [
    {
      id: 'main',
      label: currentTheme.id === 'cyberpunk' ? 'MAIN_HUB' : 'Ana Sayfa',
      icon: Home,
      emoji: getCyberEmoji('🏠'),
      items: [
        { path: '/', icon: Heart, label: currentTheme.id === 'cyberpunk' ? 'MAIN_HUB' : 'Ana Sayfa', emoji: getCyberEmoji('🏠') }
      ]
    },
    {
      id: 'communication',
      label: currentTheme.id === 'cyberpunk' ? 'NET_COMM' : 'İletişim',
      icon: MessageSquare,
      emoji: getCyberEmoji('💌'),
      items: [
        { path: '/letters', icon: Mail, label: currentTheme.id === 'cyberpunk' ? 'DATA_MAILS' : 'Mektuplar', emoji: getCyberEmoji('💌') },
        { path: '/chat', icon: MessageSquare, label: currentTheme.id === 'cyberpunk' ? 'NEURAL_CHAT' : 'Sohbet', emoji: getCyberEmoji('💬') }
      ]
    },
    {
      id: 'entertainment',
      label: currentTheme.id === 'cyberpunk' ? 'MEDIA_HUB' : 'Eğlence',
      icon: Film,
      emoji: getCyberEmoji('🎬'),
      items: [
        { path: '/movies', icon: Film, label: currentTheme.id === 'cyberpunk' ? 'HOLO_FILMS' : 'Filmler', emoji: getCyberEmoji('🎬') },
        { path: '/music', icon: Music, label: currentTheme.id === 'cyberpunk' ? 'AUDIO_SYNC' : 'Müzik', emoji: getCyberEmoji('🎵') }
      ]
    },
    {
      id: 'productivity',
      label: currentTheme.id === 'cyberpunk' ? 'TASK_MATRIX' : 'Verimlilik',
      icon: CheckSquare,
      emoji: getCyberEmoji('📝'),
      items: [
        { path: '/todos', icon: CheckSquare, label: currentTheme.id === 'cyberpunk' ? 'EXEC_TASKS' : 'Yapılacaklar', emoji: getCyberEmoji('📝') },
        { path: '/calendar', icon: Calendar, label: currentTheme.id === 'cyberpunk' ? 'TIME_GRID' : 'Takvim', emoji: getCyberEmoji('📅') }
      ]
    },
    {
      id: 'memories',
      label: currentTheme.id === 'cyberpunk' ? 'DATA_VAULT' : 'Anılar',
      icon: Bookmark,
      emoji: getCyberEmoji('📷'),
      items: [
        { path: '/gallery', icon: Camera, label: currentTheme.id === 'cyberpunk' ? 'IMG_ARCHIVE' : 'Galeri', emoji: getCyberEmoji('📷') }
      ]
    },
    {
      id: 'profile',
      label: currentTheme.id === 'cyberpunk' ? 'USER_PROFILE' : 'Profil',
      icon: User,
      emoji: getCyberEmoji('👤'),
      items: [
        { path: '/profile', icon: User, label: currentTheme.id === 'cyberpunk' ? 'AVATAR_CONFIG' : 'Profilim', emoji: getCyberEmoji('👤') }
      ]
    }
  ];

  const currentCategory = navCategories.find(category => 
    category.items.some(item => item.path === location.pathname)
  );

  const toggleCategory = (categoryId: string) => {
    if (openCategory === categoryId) {
      setOpenCategory(null);
    } else {
      setOpenCategory(categoryId);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenCategory(null);
  };

  const getDisplayName = () => {
    return profileData?.displayName || currentUser?.email?.split('@')[0] || 'Kullanıcı';
  };

  const getProfileImage = () => {
    if (profileData?.profileImage) {
      return (
        <img
          src={profileData.profileImage}
          alt="Profil"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <span className="text-lg animate-wiggle">
        {profileData?.favoriteEmoji || '😺'}
      </span>
    );
  };

  // Body scroll engelleme (mobil menü açıkken)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            MindLine
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navCategories.map((category) => (
              <div key={category.id} className="relative group">
                <button
                  className={`flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm xl:text-base hover-glow ${
                    currentCategory?.id === category.id
                      ? (currentTheme.id === 'cyberpunk' ? 'bg-cyber-red text-cyber-primary shadow-cyber' : 'bg-cat-gradient text-gray-800 shadow-cat')
                      : (currentTheme.id === 'cyberpunk' ? 'text-cyber-primary hover:bg-cyber-100 hover:text-cyber-secondary hover:shadow-cyber' : 'text-gray-700 hover:bg-cat-100 hover:text-gray-800 hover:shadow-soft')
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="text-lg emoji-interactive">{category.emoji}</span>
                  <span className="hidden xl:block">{category.label}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                    openCategory === category.id ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {/* Desktop Dropdown - gelişmiş tasarım */}
                <div className={`absolute left-0 mt-2 w-56 ${currentTheme.id === 'cyberpunk' ? 'bg-cyber-50/95 border-cyber-secondary shadow-cyber' : 'bg-white/95 border-cat-200/50 shadow-magic'} backdrop-blur-xl rounded-3xl border-2 transition-all duration-300 origin-top-left z-50 ${
                  openCategory === category.id ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'
                }`}>
                  <div className="p-3">
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm rounded-2xl transition-all duration-200 hover-glow ${
                          location.pathname === item.path
                            ? (currentTheme.id === 'cyberpunk' ? 'bg-cyber-red text-cyber-primary shadow-cyber' : 'bg-cat-gradient text-gray-800 shadow-soft')
                            : (currentTheme.id === 'cyberpunk' ? 'text-cyber-primary hover:bg-cyber-100 hover:text-cyber-secondary' : 'text-gray-700 hover:bg-cat-50 hover:text-gray-800')
                        }`}
                        onClick={() => setOpenCategory(null)}
                      >
                        <span className="text-lg emoji-interactive">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Info & Controls - daha sevimli */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle
              variant="dropdown"
              showLabel={false}
              className="hidden md:block"
            />
            {/* User Profile Info - gelişmiş tasarım */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-3 p-2 rounded-full hover:bg-romantic-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-purple-300 flex items-center justify-center overflow-hidden">
                  {getProfileImage()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 max-w-24 xl:max-w-none truncate">
                    {getDisplayName()}
                  </span>
                  <span className="text-xs text-gray-600">
                    <span className="emoji-interactive">😸</span> Kedici
                  </span>
                </div>
              </Link>
            </div>

            {/* Mobile Theme Toggle */}
            <ThemeToggle
              variant="button"
              showLabel={false}
              className="md:hidden"
            />

            {/* Logout Button - daha etkileşimli */}
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-love-gradient hover:text-white rounded-full transition-all duration-300 font-medium text-sm group hover-glow ${currentTheme.styles.buttonClass}`}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Çıkış</span>
              <span className="sm:hidden emoji-interactive">🚪</span>
            </button>

            {/* Mobile Menu Button - daha sevimli */}
            <button 
              className="lg:hidden p-2 text-gray-700 hover:bg-cat-100 rounded-full transition-all duration-300 emoji-interactive"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü Arka Planı ve Menü */}
      {/* Arka plan blur ve fade ile, menü sağdan kayarak açılır */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Arka plan */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        {/* Menü paneli */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-full ${currentTheme.id === 'cyberpunk' ? 'bg-cyber-50/95 border-cyber-secondary shadow-cyber' : 'bg-white/95 border-cat-200/50 shadow-xl'} backdrop-blur-xl border-l-2 rounded-l-3xl transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="p-6">
            {/* Mobile User Info */}
            <Link
              to="/profile"
              className={`${currentTheme.id === 'cyberpunk' ? 'bg-cyber-100 border-cyber-secondary shadow-cyber hover:bg-cyber-200' : 'bg-cat-50 border-cat-200/50 shadow-soft hover:bg-cat-100'} rounded-3xl p-4 mb-4 border-2 block transition-colors`}
              onClick={closeMobileMenu}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full ${currentTheme.id === 'cyberpunk' ? 'bg-cyber-red' : 'bg-gradient-to-br from-pink-200 to-purple-300'} flex items-center justify-center overflow-hidden`}>
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className={`text-2xl emoji-interactive ${currentTheme.id === 'cyberpunk' ? 'text-cyber-primary' : ''}`}>
                      {currentTheme.id === 'cyberpunk' ? '🤖' : (profileData?.favoriteEmoji || '😺')}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${currentTheme.id === 'cyberpunk' ? 'text-cyber-primary' : 'text-gray-800'}`}>
                    {getDisplayName()}
                  </p>
                  <p className={`text-xs ${currentTheme.id === 'cyberpunk' ? 'text-cyber-secondary' : 'text-gray-600'}`}>
                    {currentTheme.id === 'cyberpunk' ? (
                      <>NEURAL_ACCESS_GRANTED <span className="emoji-interactive animate-neon-flicker">⚡</span></>
                    ) : (
                      <>Kedili alanda hoş geldin! <span className="emoji-interactive">🐾</span></>
                    )}
                  </p>
                </div>
              </div>
            </Link>
            {/* Menü Kategorileri */}
            <div className="space-y-3">
              {navCategories.map((category) => (
                <div key={category.id} className="border-b border-cat-100 pb-3 last:border-b-0">
                  <button
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-all duration-300 font-medium hover-glow ${
                      currentCategory?.id === category.id
                        ? (currentTheme.id === 'cyberpunk' ? 'bg-cyber-red text-cyber-primary shadow-cyber' : 'bg-cat-gradient text-gray-800 shadow-soft')
                        : (currentTheme.id === 'cyberpunk' ? 'text-cyber-primary hover:bg-cyber-100' : 'text-gray-700 hover:bg-cat-50')
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl emoji-interactive">{category.emoji}</span>
                      <span>{category.label}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
                      openCategory === category.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {/* Submenu */}
                  <div className={`mt-3 space-y-2 transition-all duration-300 ${
                    openCategory === category.id ? 'block' : 'hidden'
                  }`}>
                    {category.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-200 text-sm hover-glow ${
                          location.pathname === item.path
                            ? (currentTheme.id === 'cyberpunk' ? 'bg-cyber-purple text-cyber-primary shadow-cyber' : 'bg-paw-gradient text-white shadow-paw')
                            : (currentTheme.id === 'cyberpunk' ? 'text-cyber-primary hover:bg-cyber-100 hover:text-cyber-secondary' : 'text-gray-700 hover:bg-cat-50 hover:text-gray-800')
                        }`}
                        onClick={closeMobileMenu}
                      >
                        <span className="text-lg emoji-interactive">{item.emoji}</span>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Çıkış Butonu */}
            <button
              onClick={handleLogout}
              className={`mt-6 w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 font-medium text-base group hover-glow ${
                currentTheme.id === 'cyberpunk'
                  ? 'text-cyber-secondary hover:bg-cyber-red hover:text-cyber-primary'
                  : 'text-gray-700 hover:bg-love-gradient hover:text-white'
              }`}
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
