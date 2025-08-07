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
  const {} = useTheme();
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
        { path: '/gallery', icon: Camera, label: 'Galeri', emoji: '📷' }
      ]
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      emoji: '👤',
      items: [
        { path: '/profile', icon: User, label: 'Profilim', emoji: '👤' }
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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleCategoryClick = (category: NavCategory) => {
    if (category.items.length === 1) {
      navigate(category.items[0].path);
      setMobileMenuOpen(false);
    } else {
      setOpenCategory(openCategory === category.id ? null : category.id);
    }
  };

  return (
    <nav className="sticky top-0 z-[999] w-full bg-white/90 backdrop-blur-md border-b border-cat-200">
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-cat-700 hover:text-cat-500 transition-colors group"
          >
            <span className="text-2xl group-hover:animate-wiggle">😺</span>
            <div className="hidden sm:block">
              <div className="font-cat text-xl font-bold">MindLine</div>
              <div className="text-xs text-cat-500 font-elegant">Kedili Aşk Dünyası</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navCategories.map((category) => (
              <div key={category.id} className="relative group">
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-cat-700 hover:text-cat-500 hover:bg-cat-50 transition-all duration-200 text-sm group"
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden xl:block font-medium">{category.label}</span>
                  <span className="text-lg">{category.emoji}</span>
                  {category.items.length > 1 && (
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  )}
                </button>

                {/* Desktop Dropdown */}
                {category.items.length > 1 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft border border-white/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-cat-700 hover:text-cat-500 hover:bg-cat-50 transition-all duration-200 text-sm group"
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
            {/* Theme Toggle */}
            <ThemeToggle variant="button" showLabel={false} />

            {/* Profile Button */}
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3 py-1 rounded-full border border-cat-200 bg-white/70 hover:bg-cat-50 hover:border-cat-300 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-cat-100 flex items-center justify-center overflow-hidden border border-cat-300">
                {getProfileImage()}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-cat-700 group-hover:text-cat-500 max-w-24 xl:max-w-none truncate">
                  {getDisplayName()}
                </span>
                <span className="text-xs text-cat-400">Hoşgeldin</span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-cat-500 border border-cat-200 hover:border-cat-400 hover:text-cat-700 rounded-full transition-all duration-200 text-sm group"
            >
              <LogOut className="w-4 h-4 relative" />
              <span className="hidden sm:block font-medium tracking-wide relative">Çıkış</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-cat-500 hover:text-cat-700 border border-transparent hover:border-cat-300 rounded-full transition-all duration-200"
              onClick={toggleMobileMenu}
            >
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-cat-200">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-1">
              {/* Profile Section */}
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-cat-50/50 border border-cat-200/50">
                <div className="w-10 h-10 rounded-full bg-cat-100 flex items-center justify-center overflow-hidden border border-cat-300">
                  {getProfileImage()}
                </div>
                <div>
                  <div className="text-base font-medium text-cat-700">{getDisplayName()}</div>
                  <div className="text-xs text-cat-400">Hoşgeldin</div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 flex flex-col space-y-2">
                {navCategories.map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                        currentCategory?.id === category.id
                          ? 'bg-cat-100 text-cat-700 border border-cat-300'
                          : 'text-cat-600 hover:bg-cat-50 hover:text-cat-700 border border-transparent hover:border-cat-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <category.icon className="w-5 h-5" />
                        <span className="font-medium">{category.label}</span>
                        <span className="text-lg">{category.emoji}</span>
                      </div>
                      {category.items.length > 1 && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          openCategory === category.id ? 'rotate-180' : ''
                        }`} />
                      )}
                    </button>

                    {/* Mobile Submenu */}
                    {category.items.length > 1 && openCategory === category.id && (
                      <div className="mt-1 ml-4 space-y-1">
                        {category.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                              location.pathname === item.path
                                ? 'bg-cat-100 text-cat-700 border border-cat-300'
                                : 'text-cat-600 hover:bg-cat-50 hover:text-cat-700'
                            }`}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.label}</span>
                            <span className="text-base">{item.emoji}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Logout */}
                <div className="pt-4 border-t border-cat-200">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 text-cat-600 hover:bg-cat-50 hover:text-cat-700 rounded-xl transition-all duration-200 group"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış</span>
                    <span className="hidden sm:block">Çıkış</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
