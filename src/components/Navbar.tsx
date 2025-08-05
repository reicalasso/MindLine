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
      // Üretim ortamında hata yönetimi için burada bir izleme servisi kullanılabilir
      if (process.env.NODE_ENV !== 'production') {
        console.error('Profil verisi yüklenirken hata:', error);
      }
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

  // Cyberpunk tema için özel efekt yönetimi
  const [cyberEffect, setCyberEffect] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavCategory | null>(null);
  
  // Dropdown'u açıp kapatma fonksiyonu
  const handleCyberDropdown = (category: NavCategory | null) => {
    // Efekt animasyonu
    if (category) {
      setCyberEffect(true);
      setTimeout(() => {
        setActiveDropdown(category);
        setCyberEffect(false);
      }, 300);
    } else {
      setCyberEffect(true);
      setTimeout(() => {
        setActiveDropdown(null);
        setCyberEffect(false);
      }, 300);
    }
  };

  // Sayfa dışına tıklandığında dropdown'ları kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as HTMLElement).closest('.cyber-nav-item')) {
        handleCyberDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Navbar görünümü
  return (
    <nav
      className={
        currentTheme.id === 'cyberpunk'
          ? "sticky top-0 z-[999] w-full bg-gradient-to-r from-cyber-dark via-cyber-matrix to-cyber-dark backdrop-blur-xl border-b border-cyber-secondary/30 shadow-cyber-intense"
          : "sticky top-0 z-[999] w-full bg-white/90 backdrop-blur-md border-b border-cat-200"
      }
    >
      {/* Cyberpunk: animated scanline */}
      {currentTheme.id === 'cyberpunk' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-primary to-transparent animate-scan-line opacity-60"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className={
              currentTheme.id === 'cyberpunk'
                ? "text-xl font-bold bg-gradient-to-r from-cyber-primary via-cyber-accent to-cyber-electric bg-clip-text text-transparent hover:scale-110 transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] hover:drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]"
                : "text-xl font-bold bg-gradient-to-r from-cat-400 to-paw-400 bg-clip-text text-transparent hover:scale-105 transition-transform"
            }
          >
            <span className={currentTheme.id === 'cyberpunk' ? 'font-mono tracking-wider' : ''}>
              {currentTheme.id === 'cyberpunk' ? '【MINDLINE】' : 'MindLine'}
            </span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-1 relative">
            {navCategories.map((category) =>
              currentTheme.id === 'cyberpunk' ? (
                // Enhanced Cyberpunk nav button
                <div key={category.id} className="relative group">
                  <button
                    onClick={() => handleCyberDropdown(activeDropdown === category ? null : category)}
                    className={`cyber-nav-item relative px-4 py-2.5 rounded-none bg-gradient-to-r border transition-all duration-300 overflow-hidden
                      ${currentCategory?.id === category.id
                        ? 'from-cyber-red/20 to-cyber-accent/20 text-cyber-primary border-cyber-primary shadow-neon-blue animate-neon-flicker-lite'
                        : 'from-cyber-dark/80 to-cyber-matrix/80 text-cyber-secondary border-cyber-secondary/40 hover:border-cyber-primary hover:text-cyber-primary hover:shadow-neon-blue hover:from-cyber-primary/10 hover:to-cyber-accent/10'
                      }`}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      background: currentCategory?.id === category.id 
                        ? 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(199,0,255,0.1) 50%, rgba(255,0,85,0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(0,15,30,0.8) 0%, rgba(0,30,60,0.6) 100%)'
                    }}
                  >
                    {/* Digital grid overlay */}
                    <div className="absolute inset-0 opacity-20 bg-cyber-grid pointer-events-none"></div>
                    
                    {/* Glitch effect bar */}
                    <div className={`absolute top-0 left-0 h-[1px] bg-cyber-primary transition-all duration-300 ${
                      currentCategory?.id === category.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                    
                    <div className="relative flex items-center space-x-2 font-mono text-sm tracking-wide">
                      <span className="text-lg filter drop-shadow-[0_0_4px_currentColor]">{category.emoji}</span>
                      <span className="hidden xl:inline uppercase font-medium">{category.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-all duration-300 ${
                        activeDropdown === category ? 'rotate-180 text-cyber-primary' : ''
                      }`} />
                    </div>
                    
                    {/* Corner decorations */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyber-primary/60"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyber-primary/60"></div>
                  </button>
                  
                  {/* Neon underglow */}
                  {currentCategory?.id === category.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-cyber-primary blur-sm animate-pulse"></div>
                  )}
                </div>
              ) : (
                // Cat theme nav button (unchanged)
                <Link
                  key={category.id}
                  to={category.items[0].path}
                  className={`relative px-4 py-2 rounded-full flex items-center space-x-2 text-base font-cat transition-all duration-200 ${
                    currentCategory?.id === category.id
                      ? 'bg-cat-100 text-cat-700 shadow-cat border border-cat-300'
                      : 'bg-white/70 text-cat-500 border border-cat-100 hover:bg-cat-50 hover:text-cat-700'
                  }`}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="hidden xl:inline">{category.label}</span>
                </Link>
              )
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-3">
            <ThemeToggle
              variant="button"
              showLabel={false}
              className="hidden md:block"
            />

            {/* User Profile */}
            <div className="hidden lg:flex items-center">
              <Link
                to="/profile"
                className={
                  currentTheme.id === 'cyberpunk'
                    ? "flex items-center space-x-3 px-3 py-2 rounded-none border border-cyber-secondary/50 bg-gradient-to-r from-cyber-matrix/80 to-cyber-dark/80 hover:border-cyber-primary hover:from-cyber-primary/10 hover:to-cyber-accent/10 transition-all duration-300 group relative overflow-hidden"
                    : "flex items-center space-x-3 px-3 py-1 rounded-full border border-cat-200 bg-white/70 hover:bg-cat-50 hover:border-cat-300 transition-all group"
                }
                style={currentTheme.id === 'cyberpunk' ? {
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                } : {}}
              >
                {currentTheme.id === 'cyberpunk' && (
                  <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
                )}
                
                <div className={
                  currentTheme.id === 'cyberpunk'
                    ? "w-8 h-8 rounded-none bg-gradient-to-br from-cyber-primary/20 to-cyber-accent/20 flex items-center justify-center overflow-hidden border border-cyber-primary/50 relative"
                    : "w-8 h-8 rounded-full bg-cat-100 flex items-center justify-center overflow-hidden border border-cat-300"
                } style={currentTheme.id === 'cyberpunk' ? {
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                } : {}}>
                  {currentTheme.id === 'cyberpunk' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/30 to-transparent animate-pulse"></div>
                  )}
                  <div className="relative">
                    {getProfileImage()}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className={
                    currentTheme.id === 'cyberpunk'
                      ? "text-sm font-mono text-cyber-primary group-hover:text-cyber-electric max-w-24 xl:max-w-none truncate tracking-wide transition-colors"
                      : "text-sm font-medium text-cat-700 group-hover:text-cat-500 max-w-24 xl:max-w-none truncate"
                  }>
                    {currentTheme.id === 'cyberpunk' ? `>[${getDisplayName()}]` : getDisplayName()}
                  </span>
                  <span className={
                    currentTheme.id === 'cyberpunk'
                      ? "text-xs text-cyber-secondary font-mono tracking-wider"
                      : "text-xs text-cat-400"
                  }>
                    {currentTheme.id === 'cyberpunk' ? "ONLINE" : "Hoşgeldin"}
                  </span>
                </div>
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={
                currentTheme.id === 'cyberpunk'
                  ? "flex items-center space-x-2 px-4 py-2.5 text-cyber-secondary border border-cyber-secondary/50 hover:border-cyber-red hover:text-cyber-red rounded-none transition-all duration-300 text-sm group relative overflow-hidden hover:shadow-neon-red bg-gradient-to-r from-cyber-dark/80 to-cyber-matrix/80 hover:from-cyber-red/10 hover:to-cyber-red/20"
                  : "flex items-center space-x-1 px-3 py-2 text-cat-500 border border-cat-200 hover:border-cat-400 hover:text-cat-700 rounded-full transition-all duration-200 text-sm group"
              }
              style={currentTheme.id === 'cyberpunk' ? {
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
              } : {}}
            >
              {currentTheme.id === 'cyberpunk' && (
                <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none"></div>
              )}
              
              <LogOut className="w-4 h-4 relative" />
              <span className="hidden sm:block font-mono tracking-wide relative">
                {currentTheme.id === 'cyberpunk' ? "DISCONNECT" : "Çıkış"}
              </span>
              
              {currentTheme.id === 'cyberpunk' && (
                <div className="absolute top-0 right-0 w-1 h-1 bg-cyber-red opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className={
                currentTheme.id === 'cyberpunk'
                  ? "md:hidden p-2.5 text-cyber-secondary hover:text-cyber-primary border border-cyber-secondary/50 hover:border-cyber-primary rounded-none transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-cyber-dark/80 to-cyber-matrix/80 hover:from-cyber-primary/10 hover:to-cyber-accent/10"
                  : "md:hidden p-2 text-cat-500 hover:text-cat-700 border border-transparent hover:border-cat-300 rounded-full transition-all duration-200"
              }
              onClick={toggleMobileMenu}
              style={currentTheme.id === 'cyberpunk' ? {
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
              } : {}}
            >
              {currentTheme.id === 'cyberpunk' && (
                <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none"></div>
              )}
              
              <div className="relative">
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Cyberpunk Dropdown Overlay */}
      {currentTheme.id === 'cyberpunk' && activeDropdown && (
        <div className="absolute w-full left-0 top-16 z-[1000] overflow-hidden">
          <div className="container mx-auto px-4">
            <div 
              className={`bg-black/90 backdrop-blur-lg border border-cyber-secondary rounded-b-lg overflow-hidden transition-all duration-500 ${
                cyberEffect ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
              style={{
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2), 0 0 10px rgba(0, 255, 255, 0.1) inset',
                backgroundImage: 'linear-gradient(to bottom, rgba(0,30,60,0.5), rgba(0,0,0,0.7))',
              }}
            >
              <div className="cyber-grid p-4 py-5">
                {/* Digital glitchy border */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-secondary to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-secondary to-transparent opacity-30"></div>
                
                <div className="flex space-x-6">
                  <div className="w-1/4 border-r border-cyber-secondary/20 pr-4">
                    <h3 className="text-lg font-mono text-cyber-red mb-2 glitch-text">
                      {activeDropdown.label}<span className="text-xs ml-1 text-cyber-secondary">_v2.4</span>
                    </h3>
                    <p className="text-xs text-cyber-secondary font-mono leading-relaxed">
                      SYSTEM_MODULE::{activeDropdown.id.toUpperCase()}<br/>
                      STATUS::ONLINE<br/>
                      ACCESS::GRANTED<br/>
                      SECURITY::MINIMAL
                    </p>
                  </div>
                  
                  <div className="w-3/4 grid grid-cols-2 gap-2">
                    {activeDropdown.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => handleCyberDropdown(null)}
                        className="flex items-center space-x-3 p-3 hover:bg-cyber-100/10 border border-transparent hover:border-cyan-800/50 rounded-md transition-all group"
                      >
                        <span className="w-10 h-10 rounded-md bg-cyber-800/50 border border-cyan-900 flex items-center justify-center text-xl">
                          {item.emoji}
                        </span>
                        <div>
                          <div className="font-medium text-cyber-secondary group-hover:text-cyan-400 transition-colors flex items-center">
                            {item.label}
                            {location.pathname === item.path && (
                              <span className="ml-2 w-2 h-2 rounded-full bg-cyber-red animate-pulse"></span>
                            )}
                          </div>
                          <div className="text-xs text-cyan-800 font-mono group-hover:text-cyan-700">
                            {item.path.replace('/', '').toUpperCase() || 'HOME'}_MODULE
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[1001] md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={
            currentTheme.id === 'cyberpunk'
              ? "absolute inset-0 bg-black/80 backdrop-blur-sm"
              : "absolute inset-0 bg-cat-100/80 backdrop-blur-sm"
          }
          onClick={closeMobileMenu}
        ></div>

        <div
          className={
            currentTheme.id === 'cyberpunk'
              ? `absolute top-0 right-0 h-full w-80 max-w-full bg-black/95 border-l border-cyber-secondary transition-all duration-300 transform ${
                  mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`
              : `absolute top-0 right-0 h-full w-80 max-w-full bg-white/95 border-l border-cat-200 transition-all duration-300 transform ${
                  mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`
          }
          style={
            currentTheme.id === 'cyberpunk'
              ? {
                  boxShadow: '-5px 0 20px rgba(0, 255, 255, 0.1)',
                  backgroundImage: 'linear-gradient(to bottom, rgba(0,20,40,0.8), rgba(0,0,0,0.9))',
                }
              : {
                  boxShadow: '-5px 0 20px rgba(245,145,51,0.08)',
                                  backgroundImage: 'linear-gradient(to bottom, #fff8f3 0%, #fde8d1 100%)',
                                }
                          }
                        >
                          {/* Mobile Menu Content */}
                          <div className="flex flex-col h-full p-6 space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-center space-x-3">
                              <div className={
                                currentTheme.id === 'cyberpunk'
                                  ? "w-10 h-10 rounded bg-cyber-100/20 flex items-center justify-center overflow-hidden border border-cyan-600"
                                  : "w-10 h-10 rounded-full bg-cat-100 flex items-center justify-center overflow-hidden border border-cat-300"
                              }>
                                {getProfileImage()}
                              </div>
                              <div>
                                <div className={
                                  currentTheme.id === 'cyberpunk'
                                    ? "text-base font-medium text-cyan-400"
                                    : "text-base font-medium text-cat-700"
                                }>
                                  {getDisplayName()}
                                </div>
                                <div className={
                                  currentTheme.id === 'cyberpunk'
                                    ? "text-xs text-cyan-600"
                                    : "text-xs text-cat-400"
                                }>
                                  {currentTheme.id === 'cyberpunk' ? "USER_ACCESS::GRANTED" : "Hoşgeldin"}
                                </div>
                              </div>
                            </div>
                            {/* Navigation */}
                            <nav className="flex-1 flex flex-col space-y-2">
                              {navCategories.map((category) => (
                                <div key={category.id}>
                                  <button
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                                      openCategory === category.id
                                        ? (currentTheme.id === 'cyberpunk'
                                            ? 'bg-cyber-100/10 border border-cyber-secondary text-cyber-red'
                                            : 'bg-cat-50 border border-cat-200 text-cat-700')
                                        : (currentTheme.id === 'cyberpunk'
                                            ? 'bg-black/40 border border-cyber-secondary text-cyber-secondary'
                                            : 'bg-white/70 border border-cat-100 text-cat-500')
                                    }`}
                                    onClick={() => toggleCategory(category.id)}
                                  >
                                    <span className="flex items-center space-x-2">
                                      <span className="text-lg">{category.emoji}</span>
                                      <span>{category.label}</span>
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${
                                      openCategory === category.id ? 'rotate-180' : ''
                                    }`} />
                                  </button>
                                  {openCategory === category.id && (
                                    <div className="pl-6 mt-1 space-y-1">
                                      {category.items.map((item) => (
                                        <Link
                                          key={item.path}
                                          to={item.path}
                                          onClick={closeMobileMenu}
                                          className={`block px-2 py-1 rounded transition ${
                                            location.pathname === item.path
                                              ? (currentTheme.id === 'cyberpunk'
                                                  ? 'bg-cyber-red/20 text-cyber-red'
                                                  : 'bg-cat-100 text-cat-700')
                                              : (currentTheme.id === 'cyberpunk'
                                                  ? 'hover:bg-cyber-100/10 text-cyber-secondary'
                                                  : 'hover:bg-cat-50 text-cat-500')
                                          }`}
                                        >
                                          <span className="mr-2">{item.emoji}</span>
                                          {item.label}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </nav>
                            {/* Theme Toggle and Logout */}
                            <div className="flex items-center space-x-2">
                              <ThemeToggle variant="button" showLabel={false} />
                              <button
                                onClick={handleLogout}
                                className={
                                  currentTheme.id === 'cyberpunk'
                                    ? "flex items-center space-x-1 px-3 py-2 text-cyber-secondary border border-cyber-secondary hover:border-cyber-red hover:text-cyber-red rounded transition-all duration-300 text-sm group hover:shadow-[0_0_5px_rgba(255,0,60,0.5)]"
                                    : "flex items-center space-x-1 px-3 py-2 text-cat-500 border border-cat-200 hover:border-cat-400 hover:text-cat-700 rounded-full transition-all duration-200 text-sm group"
                                }
                              >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:block">{currentTheme.id === 'cyberpunk' ? "EXIT_SYS" : "Çıkış"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </nav>
                  );
                }
