import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Heart,
  Mail,
  Film,
  CheckSquare,
  Music,
  Calendar,
  Camera,
  Clock,
  Star,
  MessageCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Award,
  Activity,
  Gift,
  Users
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [stats, setStats] = useState({
    letters: 0,
    movies: 0,
    todos: 0,
    completedTodos: 0,
    music: 0,
    photos: 0,
    messages: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherMood, setWeatherMood] = useState('sunny');

  useEffect(() => {
    fetchDashboardData();
    
    // Saat ve hava durumu mood güncelleyici
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      updateWeatherMood(now);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const updateWeatherMood = (time) => {
    const hour = time.getHours();
    const moods = ['sunny', 'cloudy', 'rainy', 'starry'];
    const moodIndex = Math.floor(Math.random() * moods.length);
    if (Math.random() < 0.1) { // 10% şans ile mood değiştir
      setWeatherMood(moods[moodIndex]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Paralel veri çekme - daha hızlı
      const promises = [
        getDocs(collection(db, 'letters')),
        getDocs(collection(db, 'movies')),
        getDocs(collection(db, 'todos')),
        getDocs(query(collection(db, 'todos'), where('completed', '==', true))),
        getDocs(collection(db, 'music')),
        getDocs(collection(db, 'gallery')),
        getDocs(collection(db, 'messages')),
        getDocs(query(collection(db, 'letters'), orderBy('createdAt', 'desc'), limit(8))),
        getDocs(query(collection(db, 'calendar'), where('date', '>=', new Date()), orderBy('date', 'asc'), limit(5)))
      ];

      const [
        lettersSnap,
        moviesSnap,
        todosSnap,
        completedTodosSnap,
        musicSnap,
        photosSnap,
        messagesSnap,
        recentLettersSnap,
        eventsSnap
      ] = await Promise.all(promises);

      // İstatistikleri güncelle
      setStats({
        letters: lettersSnap.size,
        movies: moviesSnap.size,
        todos: todosSnap.size - completedTodosSnap.size,
        completedTodos: completedTodosSnap.size,
        music: musicSnap.size,
        photos: photosSnap.size,
        messages: messagesSnap.size
      });

      // Son aktiviteler - daha zengin içerik
      const activities = [];
      
      // Son mektuplar
      recentLettersSnap.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'letter',
          title: data.title || 'Başlıksız Mektup',
          time: data.createdAt?.toDate(),
          author: data.author,
          icon: Mail,
          color: 'text-pink-600',
          emoji: '💌',
          bg: 'bg-pink-50',
          preview: data.content?.substring(0, 80) + '...'
        });
      });

      // Son mesajlar
      const recentMessagesSnap = await getDocs(
        query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5))
      );
      recentMessagesSnap.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'message',
          title: data.content?.substring(0, 50) + '...' || 'Dosya gönderildi',
          time: data.createdAt?.toDate(),
          author: data.author,
          icon: MessageCircle,
          color: 'text-blue-600',
          emoji: '💬',
          bg: 'bg-blue-50'
        });
      });

      // Son fotoğraflar
      const recentPhotosSnap = await getDocs(
        query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(3))
      );
      recentPhotosSnap.docs.forEach(doc => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: 'photo',
          title: data.caption || 'Yeni fotoğraf',
          time: data.createdAt?.toDate(),
          author: data.author,
          icon: Camera,
          color: 'text-purple-600',
          emoji: '📸',
          bg: 'bg-purple-50'
        });
      });

      // Tarihe göre sırala ve sınırla
      activities.sort((a, b) => (b.time || 0) - (a.time || 0));
      setRecentActivities(activities.slice(0, 8));

      // Yaklaşan etkinlikler
      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(events);

    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Aşk Mektubu Yaz',
      description: 'Sevgine en güzel sözlerini yaz',
      icon: Mail,
      emoji: '💌',
      link: '/letters',
      gradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-red-500',
      hover: 'hover:from-rose-500 hover:via-pink-600 hover:to-red-600',
      category: 'İletişim'
    },
    {
      title: 'Kedili Sohbet',
      description: 'Gerçek zamanlı mesajlaşın',
      icon: MessageCircle,
      emoji: '😺',
      link: '/chat',
      gradient: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500',
      hover: 'hover:from-blue-500 hover:via-cyan-600 hover:to-teal-600',
      category: 'İletişim'
    },
    {
      title: 'Anı Fotoğrafı',
      description: 'Özel anlarınızı ölümsüzleştirin',
      icon: Camera,
      emoji: '📸',
      link: '/gallery',
      gradient: 'bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500',
      hover: 'hover:from-purple-500 hover:via-violet-600 hover:to-indigo-600',
      category: 'Anılar'
    },
    {
      title: 'Film Keşfi',
      description: 'Birlikte izlenecek filmler bulun',
      icon: Film,
      emoji: '🎬',
      link: '/movies',
      gradient: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500',
      hover: 'hover:from-orange-500 hover:via-amber-600 hover:to-yellow-600',
      category: 'Eğlence'
    },
    {
      title: 'Birlikte Planlar',
      description: 'Gelecek planlarınızı organize edin',
      icon: CheckSquare,
      emoji: '📋',
      link: '/todos',
      gradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
      hover: 'hover:from-emerald-500 hover:via-green-600 hover:to-teal-600',
      category: 'Organizasyon'
    },
    {
      title: 'Müzik Listeleri',
      description: 'Ortak müzik zevkinizi keşfedin',
      icon: Music,
      emoji: '🎵',
      link: '/music',
      gradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
      hover: 'hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-600',
      category: 'Eğlence'
    },
    {
      title: 'Özel Günler',
      description: 'Unutulmaz tarihleri hatırlayın',
      icon: Calendar,
      emoji: '💖',
      link: '/calendar',
      gradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-500',
      hover: 'hover:from-pink-500 hover:via-rose-600 hover:to-red-600',
      category: 'Organizasyon'
    },
    {
      title: 'Hediye Fikirleri',
      description: 'Birbirinize sürprizler planlayın',
      icon: Gift,
      emoji: '🎁',
      link: '/gifts',
      gradient: 'bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500',
      hover: 'hover:from-violet-500 hover:via-purple-600 hover:to-pink-600',
      category: 'Özel'
    }
  ];

  const statCards = [
    {
      title: 'Aşk Mektupları',
      value: stats.letters,
      icon: Mail,
      emoji: '💌',
      gradient: 'bg-gradient-to-br from-pink-400 to-rose-500',
      link: '/letters',
      change: '+' + Math.floor(stats.letters / 7) + ' bu hafta',
      trend: 'up'
    },
    {
      title: 'Sohbet Mesajları',
      value: stats.messages,
      icon: MessageCircle,
      emoji: '💬',
      gradient: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      link: '/chat',
      change: 'Aktif 🟢',
      trend: 'stable'
    },
    {
      title: 'Film Koleksiyonu',
      value: stats.movies,
      icon: Film,
      emoji: '🎬',
      gradient: 'bg-gradient-to-br from-orange-400 to-red-500',
      link: '/movies',
      change: `${stats.movies > 0 ? '🍿 İzlenecek var' : '📝 Liste boş'}`,
      trend: stats.movies > 5 ? 'up' : 'down'
    },
    {
      title: 'Tamamlanan Görevler',
      value: `${stats.completedTodos}/${stats.todos + stats.completedTodos}`,
      icon: CheckSquare,
      emoji: '✅',
      gradient: 'bg-gradient-to-br from-green-400 to-emerald-500',
      link: '/todos',
      change: stats.todos > 0 ? `${stats.todos} bekliyor` : '🎉 Hepsi tamam',
      trend: stats.todos === 0 ? 'up' : 'stable'
    },
    {
      title: 'Anı Fotoğrafları',
      value: stats.photos,
      icon: Camera,
      emoji: '📸',
      gradient: 'bg-gradient-to-br from-purple-400 to-violet-500',
      link: '/gallery',
      change: '📷 Güzel anılar',
      trend: 'up'
    },
    {
      title: 'Müzik Parçaları',
      value: stats.music,
      icon: Music,
      emoji: '🎵',
      gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500',
      link: '/music',
      change: '🎧 Ortak zevk',
      trend: 'up'
    }
  ];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return { text: 'Gece Kedisi', emoji: '🌙', color: 'from-indigo-500 to-purple-600' };
    if (hour < 12) return { text: 'Günaydın Sevgilim', emoji: '🌅', color: 'from-orange-400 to-pink-500' };
    if (hour < 17) return { text: 'İyi Günler Aşkım', emoji: '☀️', color: 'from-yellow-400 to-orange-500' };
    if (hour < 21) return { text: 'İyi Akşamlar Canım', emoji: '🌆', color: 'from-purple-400 to-pink-500' };
    return { text: 'İyi Geceler Tatlım', emoji: '🌃', color: 'from-blue-600 to-purple-700' };
  };

  const getRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}sa`;
    if (days < 7) return `${days}g`;
    return date.toLocaleDateString('tr-TR');
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 100;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
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
            ></div>
          ))}
        </div>
        <p className="text-gray-700 font-cat text-xl">Kedili dünya hazırlanıyor...</p>
      </div>
    );
  }

  const greeting = getGreeting();
  const totalItems = stats.letters + stats.messages + stats.photos;
  const completionRate = getProgressPercentage(stats.completedTodos, stats.todos + stats.completedTodos);

  return (
    <div className="space-y-8 px-2 sm:px-0">
      {/* Enhanced Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${greeting.color} rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl border border-white/20`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-20 right-16 w-24 h-24 bg-white/15 rounded-full blur-2xl animate-wiggle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-16 w-20 h-20 bg-white/10 rounded-full blur-xl animate-purr" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-10 w-36 h-36 bg-white/10 rounded-full blur-3xl animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="relative z-10 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <span className="text-7xl sm:text-8xl lg:text-9xl animate-float drop-shadow-lg">😺</span>
              <span className="absolute -top-4 -right-4 text-3xl animate-bounce-love">{greeting.emoji}</span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-white/20 rounded-full blur-lg"></div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cat mb-4 drop-shadow-lg">
            {greeting.text}! 
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl font-elegant max-w-3xl mx-auto px-4 mb-6 opacity-90">
            <span className="inline-block animate-wiggle mr-2">🐾</span>
            Kedili aşk dünyamızda {totalItems} anı biriktirdiniz
            <span className="inline-block animate-wiggle ml-2">💕</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm lg:text-base opacity-80">
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Clock className="w-5 h-5" />
              <span>{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              <span>{currentTime.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Target className="w-5 h-5" />
              <span>%{completionRate} Tamamlandı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-cat text-gray-800 flex items-center">
            <Activity className="w-7 h-7 mr-3 text-pink-500" />
            Kedili İstatistikler
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-green-100 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Canlı</span>
            </div>
            <span className="text-sm text-gray-600 flex items-center">
              <Sparkles className="w-4 h-4 mr-1" />
              Son güncelleme: az önce
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="group relative overflow-hidden cat-card p-4 sm:p-6 hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:animate-purr relative`}>
                    <span className="text-xl sm:text-2xl">{stat.emoji}</span>
                    {stat.trend === 'up' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors group-hover:translate-x-1" />
                </div>
                
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 font-elegant">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 font-cat mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Enhanced Quick Actions */}
        <div className="xl:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-cat text-gray-800 mb-6 flex items-center">
            <Zap className="w-7 h-7 mr-3 text-yellow-500" />
            Hızlı İşlemler
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group relative overflow-hidden cat-card p-6 hover:scale-105 transition-all duration-300"
              >
                <div className={`absolute inset-0 ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 ${action.gradient} rounded-3xl flex items-center justify-center shadow-lg group-hover:animate-purr relative`}>
                      <span className="text-2xl">{action.emoji}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                      {action.category}
                    </span>
                  </div>
                  
                  <h3 className="font-cat text-lg text-gray-800 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-700 font-elegant mb-3">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition-colors">
                    <span className="text-sm font-medium">Başla</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Recent Activities */}
          <div className="cat-card p-6">
            <h3 className="text-xl font-cat text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Son Aktiviteler
            </h3>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${activity.bg} hover:bg-opacity-80 transition-colors`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm flex-shrink-0`}>
                      <span className="text-lg">{activity.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {activity.title}
                      </p>
                      {activity.preview && (
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {activity.preview}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {getRelativeTime(activity.time)}
                        </p>
                        <span className={`text-xs font-medium ${activity.color}`}>
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Henüz aktivite yok</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="cat-card p-6">
              <h3 className="text-xl font-cat text-gray-800 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Yaklaşan Özel Günler
              </h3>
              
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {event.date?.toDate?.()?.toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      {Math.ceil((event.date?.toDate?.() - new Date()) / (1000 * 60 * 60 * 24))} gün
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="cat-card p-6">
            <h3 className="text-xl font-cat text-gray-800 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-purple-500" />
              İlerleme Durumu
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tamamlanan Görevler</span>
                  <span className="text-sm text-gray-600">{completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Aktif İletişim</span>
                  <span className="text-sm text-gray-600">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full w-[95%] transition-all duration-1000"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Anı Koleksiyonu</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full w-[87%] transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Motivation Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
        {/* Enhanced Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float blur-2xl"></div>
          <div className="absolute top-20 right-16 w-24 h-24 bg-white/15 rounded-full animate-wiggle blur-xl" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-16 w-20 h-20 bg-white/10 rounded-full animate-purr blur-lg" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 right-10 w-36 h-36 bg-white/10 rounded-full animate-float blur-3xl" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse blur-lg" style={{animationDelay: '3s'}}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <span className="text-6xl animate-purr drop-shadow-lg">💕</span>
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce-love">✨</div>
            </div>
          </div>
          
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-cat mb-4 drop-shadow-lg">
            Aşk, Paylaştığınız Her Anla Büyür
          </h3>
          
          <p className="font-elegant text-lg sm:text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto px-4 mb-6">
            Birlikte yarattığınız {totalItems} anı, kedili dünyamızda sonsuza kadar kalacak... 
            <span className="inline-block animate-wiggle ml-2">🐱💖</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">{totalItems} Anı Yaratıldı</span>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">2 Kedici Aşık</span>
            </div>
            <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Sonsuz Sevgi</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link
              to="/letters"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-8 py-3 font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              <span>Yeni Bir Mektup Yaz</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
