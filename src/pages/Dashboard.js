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
      link: '/letters',
      color: 'bg-romantic-100 text-romantic-700'
    },
    {
      title: 'Film Ekle',
      description: 'İzlemek istediğin filmi ekle',
      icon: Film,
      link: '/movies',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Yapılacak Ekle',
      description: 'Birlikte yapacağınız şeyi not et',
      icon: CheckSquare,
      link: '/todos',
      color: 'bg-green-100 text-green-700'
    }
  ];

  const statCards = [
    {
      title: 'Yazılan Mektuplar',
      value: stats.letters,
      icon: Mail,
      color: 'text-romantic-500',
      link: '/letters'
    },
    {
      title: 'Film Listesi',
      value: stats.movies,
      icon: Film,
      color: 'text-blue-500',
      link: '/movies'
    },
    {
      title: 'Yapılacaklar',
      value: `${stats.completedTodos}/${stats.todos}`,
      icon: CheckSquare,
      color: 'text-green-500',
      link: '/todos'
    },
    {
      title: 'Müzik Listesi',
      value: stats.music,
      icon: Music,
      color: 'text-purple-500',
      link: '/music'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romantic-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hoş Geldin Başlığı */}
      <div className="text-center">
        <h1 className="text-4xl font-futuristic text-futuristic-700 mb-2 flex items-center justify-center">
          <span className="mr-2">😺</span>
          Hoş Geldin!
        </h1>
        <p className="text-lg text-futuristic-600 font-futuristic">
          Kedili futuristik alanınız!
        </p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-romantic-100 card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Hızlı İşlemler */}
      <div>
        <h2 className="text-2xl font-romantic text-romantic-700 mb-6 flex items-center">
          <Star className="w-6 h-6 mr-2" />
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-romantic-100"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Son Mektuplar */}
      {recentLetters.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-romantic text-romantic-700 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Son Yazılan Mektuplar
            </h2>
            <Link
              to="/letters"
              className="text-romantic-600 hover:text-romantic-700 text-sm font-medium"
            >
              Tümünü Gör
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentLetters.map((letter) => (
              <div
                key={letter.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-romantic-100"
              >
                <h3 className="font-handwriting text-lg text-romantic-700 mb-2">
                  {letter.title || 'Başlıksız Mektup'}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {letter.content.substring(0, 100)}...
                </p>
                <p className="text-xs text-romantic-500">
                  {letter.date?.toDate?.()?.toLocaleDateString('tr-TR') || 'Tarih yok'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivasyon Mesajı */}
      <div className="bg-love-gradient rounded-xl p-8 text-center text-white">
        <Heart className="w-12 h-12 mx-auto mb-4 animate-pulse" />
        <h3 className="text-2xl font-romantic mb-2">
          Aşk, paylaştığınız her anla büyür 💕
        </h3>
        <p className="font-elegant text-lg opacity-90">
          Birlikte yarattığınız anılar sonsuza kadar burada kalacak...
        </p>
      </div>
    </div>
  );
}
