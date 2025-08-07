import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme, ThemeMode } from '../types/theme';
import { Palette, Check, Heart, Zap, Leaf, Waves, Monitor } from 'lucide-react';

interface ThemeSelectorProps {
  showLabel?: boolean;
  className?: string;
  variant?: 'dropdown' | 'grid' | 'tabs';
}

export function ThemeSelector({ 
  showLabel = true, 
  className = '', 
  variant = 'dropdown' 
}: ThemeSelectorProps) {
  const { currentTheme, setThemeMode, availableThemes, isThemeLoading } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (theme: Theme) => {
    switch (theme.id) {
      case 'cat':
        return '😺';
      case 'romantic':
        return <Heart className="w-4 h-4" />;
      case 'cyberpunk':
        return <Zap className="w-4 h-4" />;
      case 'minimal':
        return <Monitor className="w-4 h-4" />;
      case 'nature':
        return <Leaf className="w-4 h-4" />;
      case 'ocean':
        return <Waves className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Theme['category']) => {
    switch (category) {
      case 'cute':
        return 'bg-pink-100 text-pink-800';
      case 'romantic':
        return 'bg-rose-100 text-rose-800';
      case 'dark':
        return 'bg-gray-100 text-gray-800';
      case 'minimal':
        return 'bg-slate-100 text-slate-800';
      case 'colorful':
        return 'bg-rainbow-gradient text-white';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isThemeLoading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        {showLabel && <div className="w-24 h-4 bg-gray-200 rounded"></div>}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showLabel && (
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Tema Seç
          </h3>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setThemeMode(theme.id as ThemeMode)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg
                ${currentTheme.id === theme.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceVariant} 100%)`,
              }}
            >
              {/* Tema önizlemesi */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">
                  {typeof getThemeIcon(theme) === 'string' 
                    ? getThemeIcon(theme) 
                    : <span className="text-xl">{theme.emoji}</span>
                  }
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-medium text-sm" style={{ color: theme.colors.text }}>
                    {theme.name}
                  </h4>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    {theme.description}
                  </p>
                </div>
              </div>
              
              {/* Renk paleti */}
              <div className="flex space-x-1 mb-2">
                <div 
                  className="w-4 h-4 rounded-full border border-white/50"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-white/50"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-white/50"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              {/* Kategori */}
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(theme.category)}`}>
                {theme.category}
              </span>

              {/* Seçili işareti */}
              {currentTheme.id === theme.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <label className="text-sm font-medium text-gray-700">Tema</label>
        )}
        <div className="flex flex-wrap gap-2">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setThemeMode(theme.id as ThemeMode)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                flex items-center space-x-2
                ${currentTheme.id === theme.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{theme.emoji}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tema
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full flex items-center justify-between px-4 py-3 
          bg-white border border-gray-300 rounded-lg shadow-sm
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors duration-200
        "
        style={{ borderColor: currentTheme.colors.border }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl">{currentTheme.emoji}</span>
          <div className="text-left">
            <div className="font-medium text-gray-900">{currentTheme.name}</div>
            <div className="text-sm text-gray-500">{currentTheme.description}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div 
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: currentTheme.colors.primary }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: currentTheme.colors.secondary }}
            />
            <div 
              className="w-3 h-3 rounded-full border border-white/50"
              style={{ backgroundColor: currentTheme.colors.accent }}
            />
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 right-0 mt-2 
          bg-white border border-gray-200 rounded-lg shadow-xl z-50
          max-h-80 overflow-y-auto
        ">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setThemeMode(theme.id as ThemeMode);
                setIsOpen(false);
              }}
              className="
                w-full px-4 py-3 text-left hover:bg-gray-50 
                flex items-center justify-between
                transition-colors duration-150
                first:rounded-t-lg last:rounded-b-lg
              "
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{theme.emoji}</span>
                <div>
                  <div className="font-medium text-gray-900">{theme.name}</div>
                  <div className="text-sm text-gray-500">{theme.description}</div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getCategoryColor(theme.category)}`}>
                    {theme.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                
                {currentTheme.id === theme.id && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
