import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, ChevronDown } from 'lucide-react';
import { ThemeMode } from '../types/theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'button';
}

export default function ThemeToggle({ 
  className = '', 
  showLabel = true, 
  variant = 'dropdown' 
}: ThemeToggleProps) {
  const { currentTheme, themeMode, setThemeMode, toggleTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setIsOpen(false);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg ${
          currentTheme.styles.buttonClass
        } ${className}`}
        title={`Tema: ${currentTheme.name}`}
      >
        <span className="text-lg animate-wiggle">{currentTheme.emoji}</span>
        {showLabel && (
          <span className="text-sm font-medium hidden sm:block">
            {currentTheme.name}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 hover:shadow-lg ${
          currentTheme.styles.buttonClass
        }`}
        title="Tema Değiştir"
      >
        <Palette className="w-4 h-4" />
        <span className="text-lg animate-wiggle">{currentTheme.emoji}</span>
        {showLabel && (
          <span className="text-sm font-medium hidden sm:block">
            {currentTheme.name}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-magic border-2 border-cat-200/50 z-50 overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-600 mb-3 px-2">
                Tema Seç
              </div>
              
              <div className="space-y-1">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id as ThemeMode)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                      themeMode === theme.id
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-md'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    {/* Tema önizleme kutusu */}
                    <div 
                      className="w-8 h-8 rounded-lg border-2 border-white shadow-sm flex items-center justify-center text-lg"
                      style={{ 
                        background: theme.colors.background.includes('gradient') 
                          ? `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.secondary}40)`
                          : theme.colors.background 
                      }}
                    >
                      <span className="animate-wiggle">{theme.emoji}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800 text-sm">
                          {theme.name}
                        </span>
                        {themeMode === theme.id && (
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Theme info */}
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-medium text-purple-800">
                    Şu anki tema
                  </span>
                </div>
                <p className="text-xs text-purple-700">
                  <span className="font-medium">{currentTheme.name}</span> - {currentTheme.description}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
