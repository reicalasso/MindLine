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
          background: colors.backgroundGradient 
        }}
      >
        <div className="animate-pulse text-center">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full animate-spin"
            style={{ 
              border: `3px solid ${colors.primary}20`,
              borderTopColor: colors.primary
            }}
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
        background: colors.backgroundGradient 
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div 
          className={`text-center mb-8 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden ${
            currentTheme.animations.custom?.purr ? 'hover:animate-purr' : ''
          }`}
          style={{
            backgroundColor: colors.surface + 'E6',
            border: `1px solid ${colors.border}40`,
            boxShadow: `0 10px 40px ${colors.shadow}`
          }}
        >
          {/* Tema Özel Dekoratif Elementler */}
          <div className="absolute top-4 right-4" style={{ 
            animation: currentTheme.animations.custom?.wave || currentTheme.animations.custom?.float || 'none'
          }}>
            <span style={{ color: colors.primary + '60', fontSize: '1.5rem' }}>
              {currentTheme.emoji}
            </span>
          </div>
          <div className="absolute bottom-4 left-4" style={{
            animation: currentTheme.animations.custom?.ripple || currentTheme.animations.custom?.wiggle || 'pulse 2s ease-in-out infinite'
          }}>
            <span style={{ color: colors.accent + '40', fontSize: '1.25rem' }}>
              {currentTheme.id === 'ocean' ? '🐚' : currentTheme.id === 'cat' ? '🐾' : '✨'}
            </span>
          </div>

          <div 
            className="inline-block px-6 py-3 rounded-full mb-4"
            style={{
              background: colors.primaryGradient,
              boxShadow: `0 4px 20px ${colors.primary}30`
            }}
          >
            <span className="text-white font-medium">
              {greeting.emoji} {formatTime(currentTime)}
            </span>
          </div>
          
          <h1
            className={currentTheme.styles.heading}
            style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              marginBottom: '0.75rem',
              textShadow: `0 2px 10px ${colors.shadow}20`
            }}
          >
            {greeting.text}
          </h1>
          <p
            className={currentTheme.styles.text}
            style={{
              fontSize: '1.125rem',
              color: colors.textSecondary
            }}
          >
            {currentTheme.id === 'ocean' ? 'Okyanus kadar derin sevginizle bugün ne keşfetmek istersiniz? 🌊💙' :
             currentTheme.id === 'cat' ? 'Bugün ne yapmak istersiniz? 💕' :
             'Bugün hangi hedefinize odaklanmak istersiniz? ✨'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '💌', count: stats.letters, label: 'Mektup', color: colors.primary },
            { icon: '💬', count: stats.messages, label: 'Mesaj', color: colors.secondary },
            { icon: '📸', count: stats.photos, label: 'Fotoğraf', color: colors.accent },
            { icon: '🎬', count: stats.movies, label: 'Film', color: colors.info }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`p-4 rounded-2xl backdrop-blur-sm text-center transition-all duration-300 hover:scale-105 ${
                currentTheme.animations.custom?.wave ? 'hover:animate-wave' : ''
              } ${
                currentTheme.animations.custom?.wiggle ? 'hover:animate-wiggle' : ''
              }`}
              style={{
                backgroundColor: colors.surface + 'CC',
                border: `1px solid ${colors.border}40`,
                boxShadow: `0 4px 20px ${colors.shadow}15`
              }}
            >
              <div className="text-2xl mb-2" style={{
                animation: currentTheme.animations.custom?.['bounce-cat'] ? 'bounce-cat 3s infinite' : 'none'
              }}>
                {stat.icon}
              </div>
              <div 
                className="text-2xl font-bold" 
                style={{ 
                  color: stat.color,
                  fontFamily: currentTheme.typography.fontFamilyHeading
                }}
              >
                {stat.count}
              </div>
              <div className="text-xs" style={{ color: colors.textSecondary }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Menu Grid - Tema Özel Renkler */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {menuItems.map((item, index) => (
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
                  ${currentTheme.animations.custom?.flow ? 'hover:animate-flow' : ''}
                  ${currentTheme.animations.custom?.purr ? 'hover:animate-purr' : ''}
                `}
                style={{
                  backgroundColor: colors.surface + 'CC',
                  borderColor: colors.border + '40',
                  boxShadow: `0 8px 32px ${colors.shadow}20`
                }}
              >
                {/* Count badge */}
                {item.count !== undefined && (
                  <div 
                    className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ 
                      backgroundColor: colors.primary,
                      boxShadow: `0 2px 10px ${colors.primary}50`
                    }}
                  >
                    {item.count > 99 ? '99+' : item.count}
                  </div>
                )}

                {/* Icon ve Emoji */}
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center
                      transform group-hover:scale-110 transition-transform
                      shadow-lg
                    `}
                    style={{
                      background: colors.primaryGradient,
                      boxShadow: `0 8px 25px ${colors.primary}40`
                    }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span 
                    className="text-3xl transition-transform"
                    style={{
                      filter: `drop-shadow(0 2px 5px ${colors.shadow}30)`
                    }}
                  >
                    {item.emoji}
                  </span>
                </div>

                {/* İçerik */}
                <div className="space-y-3">
                  <h3
                    className={currentTheme.styles.heading}
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={currentTheme.styles.text}
                    style={{
                      color: colors.textSecondary
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="flex justify-end mt-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"
                    style={{
                      backgroundColor: colors.primary + '20',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <item.icon className="w-4 h-4" style={{ color: colors.primary }} />
                  </div>
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
                className={currentTheme.styles.heading}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
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
                      className={currentTheme.styles.text}
                      style={{ fontWeight: '500' }}
                    >
                      {activity.title}
                    </p>
                    <p 
                      className={currentTheme.styles.textMuted}
                      style={{ fontSize: '0.75rem' }}
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
            className={`${currentTheme.styles.text} mb-2`}
            style={{
              color: colors.textSecondary,
              fontSize: '0.875rem'
            }}
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

