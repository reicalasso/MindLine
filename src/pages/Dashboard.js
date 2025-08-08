import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import {
  Mail,
  MessageCircle,
  Film,
  Music,
  Calendar,
  Camera,
  CheckSquare,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = useThemeColors();

  // Basit greeting mesajı
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Sevgili';
    
    if (hour < 12) return `Günaydın ${name}! 🌅`;
    if (hour < 18) return `İyi günler ${name}! ☀️`;
    return `İyi akşamlar ${name}! 🌙`;
  };

  // Ana menü öğeleri
  const menuItems = [
    {
      title: 'Mektuplar',
      subtitle: 'Aşk dolu mektuplarınız',
      icon: Mail,
      path: '/letters',
      color: 'from-pink-400 to-rose-400',
      emoji: '💌'
    },
    {
      title: 'Sohbet',
      subtitle: 'Özel sohbetleriniz',
      icon: MessageCircle,
      path: '/chat',
      color: 'from-blue-400 to-indigo-400',
      emoji: '💬'
    },
    {
      title: 'Filmler',
      subtitle: 'Birlikte izledikleriniz',
      icon: Film,
      path: '/movies',
      color: 'from-purple-400 to-pink-400',
      emoji: '🎬'
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
      emoji: '📸'
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

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        backgroundColor: colors.background,
        backgroundImage: colors.backgroundGradient 
      }}
    >
      {/* Basit Header */}
      <div className="max-w-4xl mx-auto">
        <div 
          className="text-center mb-8 p-6 rounded-3xl backdrop-blur-sm"
          style={{
            backgroundColor: colors.surface + '90',
            border: `1px solid ${colors.border}40`
          }}
        >
          <h1 
            className="text-3xl font-bold mb-2 font-cat"
            style={{ color: colors.text }}
          >
            {getGreeting()}
          </h1>
          <p 
            className="text-lg font-elegant"
            style={{ color: colors.textSecondary }}
          >
            Bugün ne yapmak istersiniz? 💕
          </p>
        </div>

        {/* Ana Menü Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  border
                `}
                style={{
                  backgroundColor: colors.surface + 'CC',
                  borderColor: colors.border + '40'
                }}
              >
                {/* Icon ve Emoji */}
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${item.color}
                      transform group-hover:scale-110 transition-transform
                    `}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl group-hover:animate-bounce">
                    {item.emoji}
                  </span>
                </div>

                {/* İçerik */}
                <div className="space-y-2">
                  <h3 
                    className="text-xl font-bold font-cat"
                    style={{ color: colors.text }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-sm font-elegant"
                    style={{ color: colors.textSecondary }}
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

        {/* Alt Mesaj */}
        <div 
          className="text-center mt-8 p-4 rounded-2xl backdrop-blur-sm"
          style={{
            backgroundColor: colors.surface + '60',
            border: `1px solid ${colors.border}30`
          }}
        >
          <p 
            className="text-sm font-elegant"
            style={{ color: colors.textSecondary }}
          >
            💕 Her anınız değerli, her paylaşımınız özel 💕
          </p>
        </div>
      </div>
    </div>
  );
}
