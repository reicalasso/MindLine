import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Plus,
  Clock,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    letters: 0,
    movies: 0,
    todos: 0,
    completedTodos: 0,
    music: 0,
    memories: 0
  });
  const [recentLetters, setRecentLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mektup sayısı
        const lettersQuery = query(collection(db, 'letters'));
        const lettersSnap = await getDocs(lettersQuery);
        
        // Son mektuplar
        const recentLettersQuery = query(
          collection(db, 'letters'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const recentLettersSnap = await getDocs(recentLettersQuery);
        
        // Film sayısı
        const moviesQuery = query(collection(db, 'movies'));
        const moviesSnap = await getDocs(moviesQuery);
        
        // Yapılacaklar
        const todosQuery = query(collection(db, 'todos'));
        const todosSnap = await getDocs(todosQuery);
        const completedTodosQuery = query(
          collection(db, 'todos'),
          where('completed', '==', true)
        );
        const completedTodosSnap = await getDocs(completedTodosQuery);

        setStats({
          letters: lettersSnap.size,
          movies: moviesSnap.size,
          todos: todosSnap.size,
          completedTodos: completedTodosSnap.size,
          music: 0, // Henüz implementasyonu yok
          memories: 0 // Henüz implementasyonu yok
        });

        setRecentLetters(
          recentLettersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Yeni Mektup Yaz',
      description: 'Sevgiline güzel bir mektup yaz',
      icon: Mail,
      emoji: '💌',
      link: '/letters',
      gradient: 'bg-love-gradient'
    },
    {
      title: 'Film Ekle',
      description: 'İzlemek istediğin filmi ekle',
      icon: Film,
      emoji: '🎬',
      link: '/movies',
      gradient: 'bg-paw-gradient'
    },
    {
      title: 'Yapılacak Ekle',
      description: 'Birlikte yapacağınız şeyi not et',
      icon: CheckSquare,
      emoji: '📝',
      link: '/todos',
      gradient: 'bg-cat-gradient'
    }
  ];

  const statCards = [
    {
      title: 'Yazılan Mektuplar',
      value: stats.letters,
      icon: Mail,
      emoji: '💌',
      color: 'text-love-500',
      gradient: 'bg-love-gradient',
      link: '/letters'
    },
    {
      title: 'Film Listesi',
      value: stats.movies,
      icon: Film,
      emoji: '🎬',
      color: 'text-paw-500',
      gradient: 'bg-paw-gradient',
      link: '/movies'
    },
    {
      title: 'Yapılacaklar',
      value: `${stats.completedTodos}/${stats.todos}`,
      icon: CheckSquare,
      emoji: '📝',
      color: 'text-cat-500',
      gradient: 'bg-cat-gradient',
      link: '/todos'
    },
    {
      title: 'Müzik Listesi',
      value: stats.music,
      icon: Music,
      emoji: '🎵',
      color: 'text-purple-500',
      gradient: 'bg-purple-400',
      link: '/music'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="text-6xl animate-bounce-cat">😺</div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cat-300 border-t-cat-600"></div>
        <p className="text-cat-600 font-cat text-lg">Kediler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Hoş Geldin Başlığı */}
      <div className="text-center py-6 sm:py-8">
        <div className="flex justify-center mb-4 sm:mb-6">
          <span className="text-6xl sm:text-7xl lg:text-8xl animate-float">😺</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cat text-gray-800 mb-2 sm:mb-4">
          Hoş Geldin Kedici! 
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 font-elegant max-w-2xl mx-auto px-4">
          <span className="inline-block animate-wiggle mr-2">🐾</span>
          Kedili aşk dünyanda her şey seni bekliyor
          <span className="inline-block animate-wiggle ml-2">💕</span>
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="cat-card p-4 sm:p-6 hover:scale-105 transition-all duration-300 group"
          >
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-paw group-hover:animate-purr`}>
                <span className="text-xl sm:text-2xl">{stat.emoji}</span>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 font-elegant">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 font-cat">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Hızlı İşlemler */}
      <div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-cat text-gray-800 mb-4 sm:mb-6 flex items-center justify-center sm:justify-start">
          <span className="text-2xl sm:text-3xl mr-2 sm:mr-3 animate-wiggle">⭐</span>
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="cat-card p-4 sm:p-6 hover:scale-105 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 ${action.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-paw group-hover:animate-purr mx-auto sm:mx-0`}>
                <span className="text-2xl sm:text-3xl">{action.emoji}</span>
              </div>
              <h3 className="font-cat text-lg sm:text-xl text-gray-800 mb-2 text-center sm:text-left">
                {action.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 font-elegant text-center sm:text-left">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Son Mektuplar */}
      {recentLetters.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-cat text-gray-800 flex items-center justify-center sm:justify-start">
              <span className="text-2xl sm:text-3xl mr-2 sm:mr-3 animate-float">💌</span>
              Son Mektuplar
            </h2>
            <Link
              to="/letters"
              className="text-gray-700 hover:text-gray-800 text-sm sm:text-base font-elegant transition-colors text-center sm:text-right paw-trail"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentLetters.map((letter) => (
              <div
                key={letter.id}
                className="cat-card p-4 sm:p-6 group"
              >
                <h3 className="font-handwriting text-lg sm:text-xl text-gray-800 mb-2 sm:mb-3 group-hover:text-gray-900 transition-colors">
                  {letter.title || 'Başlıksız Mektup'} 💕
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-3 font-elegant">
                  {letter.content.substring(0, 100)}...
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-elegant">
                  <span className="mr-2">📅</span>
                  {letter.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivasyon Mesajı */}
      <div className="bg-love-gradient rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-center text-white shadow-paw relative overflow-hidden">
        {/* Arka plan süslemeleri */}
        <div className="absolute top-4 left-4 text-3xl sm:text-4xl opacity-20 animate-float">💕</div>
        <div className="absolute top-4 right-4 text-3xl sm:text-4xl opacity-20 animate-float" style={{animationDelay: '1s'}}>😺</div>
        <div className="absolute bottom-4 left-4 text-3xl sm:text-4xl opacity-20 animate-float" style={{animationDelay: '2s'}}>🐾</div>
        <div className="absolute bottom-4 right-4 text-3xl sm:text-4xl opacity-20 animate-float" style={{animationDelay: '0.5s'}}>💖</div>
        
        <div className="relative z-10">
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6 animate-purr">💕</div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-cat mb-2 sm:mb-4 text-gray-800">
            Aşk, paylaştığınız her anla büyür
          </h3>
          <p className="font-elegant text-base sm:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto px-4 text-gray-100">
            Birlikte yarattığınız anılar kedili dünyamızda sonsuza kadar kalacak... 
            <span className="inline-block animate-wiggle ml-2">🐱💖</span>
          </p>
        </div>
      </div>
    </div>
  );
}
