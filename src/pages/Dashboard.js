import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Mail,
  MessageCircle,
  Film,
  Music,
  Calendar,
  Camera,
  CheckSquare,
  ArrowRight,
  Heart,
  Sparkles,
  Clock,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [stats, setStats] = useState({
    letters: 0,
    messages: 0,
    photos: 0,
    movies: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Saat güncelleyici
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Dashboard verileri
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Basit istatistikler
      const [lettersSnap, messagesSnap, photosSnap, moviesSnap] = await Promise.all([
        getDocs(collection(db, 'letters')),
        getDocs(collection(db, 'messages')),
        getDocs(collection(db, 'gallery')),
        getDocs(collection(db, 'movies'))
      ]);

      setStats({
        letters: lettersSnap.size,
        messages: messagesSnap.size,
        photos: photosSnap.size,
        movies: moviesSnap.size
      });

      // Son aktiviteler
      const recentLetters = await getDocs(
        query(collection(db, 'letters'), orderBy('createdAt', 'desc'), limit(3))
      );
      
      const activities = recentLetters.docs.map(doc => ({
        id: doc.id,
        type: 'letter',
        title: doc.data().title || 'Yeni Mektup',
        time: doc.data().createdAt?.toDate(),
        icon: Mail,
        color: 'text-pink-600'
      }));

      setRecentActivities(activities);
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Zaman ve selamlama
  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Sevgili';
    
    if (hour < 12) return { text: `Günaydın ${name}!`, emoji: '🌅', color: 'from-yellow-400 to-orange-400' };
    if (hour < 18) return { text: `İyi günler ${name}!`, emoji: '☀️', color: 'from-blue-400 to-cyan-400' };
    return { text: `İyi akşamlar ${name}!`, emoji: '🌙', color: 'from-purple-400 to-indigo-400' };
  };

  const greeting = getGreeting();

  // Ana menü öğeleri
  const menuItems = [
    {
      title: 'Mektuplar',
      subtitle: 'Aşk dolu mektuplarınız',
      icon: Mail,
      path: '/letters',
      color: 'from-pink-400 to-rose-400',
      emoji: '💌',
      count: stats.letters
    },
    {
      title: 'Sohbet',
      subtitle: 'Özel sohbetleriniz',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-blue-400 to-indigo-400',
      emoji: '💬',
      count: stats.messages
    },
    {
      title: 'Filmler',
      subtitle: 'Birlikte izledikleriniz',
      icon: Film,
      path: '/movies',
      color: 'from-purple-400 to-pink-400',
      emoji: '🎬',
      count: stats.movies
    },
    {
      title: 'Müzik',
      subtitle: 'Özel şarkılarınız',
      icon: Music,
      path: '/music',
      color: 'from-green-400 to-blue-400',
      emoji: '🎵'
    },
    {
      title: 'Takvim',
      subtitle: 'Önemli günleriniz',
      icon: Calendar,
      path: '/calendar',
      color: 'from-orange-400 to-red-400',
      emoji: '📅'
    },
    {
      title: 'Galeri',
      subtitle: 'Anılarınız',
      icon: Camera,
      path: '/gallery',
      color: 'from-purple-400 to-blue-400',
      emoji: '📸',
      count: stats.photos
    },
    {
      title: 'Yapılacaklar',
      subtitle: 'Birlikte planlarınız',
      icon: CheckSquare,
      path: '/todos',
      color: 'from-emerald-400 to-green-400',
      emoji: '✅'
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          backgroundColor: colors.background,
          backgroundImage: colors.backgroundGradient 
        }}
      >
        <div className="animate-pulse text-center">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full"
            style={{ backgroundColor: colors.primary + '40' }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient 
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div 
          className="text-center mb-8 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden"
          style={{
            backgroundColor: colors.surface + '90',
            border: `1px solid ${colors.border}40`
          }}
        >
          {/* Floating elements */}
          <div className="absolute top-4 right-4 animate-float">
            <Heart className="w-6 h-6" style={{ color: colors.primary + '60' }} />
          </div>
          <div className="absolute bottom-4 left-4 animate-pulse">
            <Sparkles className="w-5 h-5" style={{ color: colors.accent + '60' }} />
          </div>

          <div 
            className={`inline-block px-6 py-3 rounded-full mb-4 bg-gradient-to-r ${greeting.color}`}
          >
            <span className="text-white font-medium">
              {greeting.emoji} {formatTime(currentTime)}
            </span>
          </div>
          
          <h1
            className={`text-4xl font-bold mb-3 ${currentTheme.id === 'cat' ? 'font-cat' : 'font-minimal'}`}
            style={{
              color: colors.text,
              fontFamily: currentTheme.typography.fontFamilyHeading
            }}
          >
            {greeting.text}
          </h1>
          <p
            className={`text-lg ${currentTheme.id === 'cat' ? 'font-elegant' : 'font-minimal'}`}
            style={{
              color: colors.textSecondary,
              fontFamily: currentTheme.typography.fontFamily
            }}
          >
            Bugün ne yapmak istersiniz? 💕
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div 
            className="p-4 rounded-2xl backdrop-blur-sm text-center"
            style={{
              backgroundColor: colors.surface + 'CC',
              border: `1px solid ${colors.border}40`
            }}
          >
            <div className="text-2xl mb-2">💌</div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {stats.letters}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Mektup
            </div>
          </div>
          
          <div 
            className="p-4 rounded-2xl backdrop-blur-sm text-center"
            style={{
              backgroundColor: colors.surface + 'CC',
              border: `1px solid ${colors.border}40`
            }}
          >
            <div className="text-2xl mb-2">💬</div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {stats.messages}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Mesaj
            </div>
          </div>
          
          <div 
            className="p-4 rounded-2xl backdrop-blur-sm text-center"
            style={{
              backgroundColor: colors.surface + 'CC',
              border: `1px solid ${colors.border}40`
            }}
          >
            <div className="text-2xl mb-2">📸</div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {stats.photos}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Fotoğraf
            </div>
          </div>
          
          <div 
            className="p-4 rounded-2xl backdrop-blur-sm text-center"
            style={{
              backgroundColor: colors.surface + 'CC',
              border: `1px solid ${colors.border}40`
            }}
          >
            <div className="text-2xl mb-2">🎬</div>
            <div className="text-2xl font-bold" style={{ color: colors.primary }}>
              {stats.movies}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Film
            </div>
          </div>
        </div>

        {/* Main Menu Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group"
            >
              <div 
                className={`
                  p-6 rounded-3xl backdrop-blur-sm
                  transform transition-all duration-300
                  hover:scale-105 hover:shadow-xl
                  border relative overflow-hidden
                `}
                style={{
                  backgroundColor: colors.surface + 'CC',
                  borderColor: colors.border + '40'
                }}
              >
                {/* Count badge */}
                {item.count !== undefined && (
                  <div 
                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </div>
                )}

                {/* Icon ve Emoji */}
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${item.color}
                      transform group-hover:scale-110 transition-transform
                      shadow-lg
                    `}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-3xl group-hover:animate-bounce">
                    {item.emoji}
                  </span>
                </div>

                {/* İçerik */}
                <div className="space-y-3">
                  <h3
                    className={`text-xl font-bold ${currentTheme.id === 'cat' ? 'font-cat' : 'font-minimal'}`}
                    style={{
                      color: colors.text,
                      fontFamily: currentTheme.typography.fontFamilyHeading
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm ${currentTheme.id === 'cat' ? 'font-elegant' : 'font-minimal'}`}
                    style={{
                      color: colors.textSecondary,
                      fontFamily: currentTheme.typography.fontFamily
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="flex justify-end mt-4">
                  <ArrowRight 
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100"
                    style={{ color: colors.primary }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <div 
            className="p-6 rounded-3xl backdrop-blur-sm"
            style={{
              backgroundColor: colors.surface + '90',
              border: `1px solid ${colors.border}40`
            }}
          >
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
              <h2
                className={`text-xl font-bold ${currentTheme.id === 'cat' ? 'font-cat' : 'font-minimal'}`}
                style={{
                  color: colors.text,
                  fontFamily: currentTheme.typography.fontFamilyHeading
                }}
              >
                Son Aktiviteler
              </h2>
            </div>
            
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center p-3 rounded-2xl"
                  style={{ backgroundColor: colors.surfaceVariant + '60' }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary + '20' }}
                  >
                    <activity.icon 
                      className="w-5 h-5" 
                      style={{ color: colors.primary }} 
                    />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="font-medium"
                      style={{ color: colors.text }}
                    >
                      {activity.title}
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {activity.time ? activity.time.toLocaleDateString('tr-TR') : 'Yakın zamanda'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Message */}
        <div 
          className="text-center mt-8 p-6 rounded-2xl backdrop-blur-sm"
          style={{
            backgroundColor: colors.surface + '60',
            border: `1px solid ${colors.border}30`
          }}
        >
          <p 
            className="text-sm font-elegant mb-2"
            style={{ color: colors.textSecondary }}
          >
            💕 Her anınız değerli, her paylaşımınız özel 💕
          </p>
          <div className="flex justify-center space-x-4 text-xs" style={{ color: colors.textMuted }}>
            <span>🌟 MindLine ile sevginizi ölümsüzleştirin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
