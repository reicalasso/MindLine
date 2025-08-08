import { useState, forwardRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import { ChevronDown } from 'lucide-react';
import { ThemeMode, themes } from '../types/theme';

interface ThemeToggleProps {
  variant?: 'button' | 'select';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ variant = 'button', showLabel = true, className = '' }, ref) => {
    const { currentTheme, themeMode, setThemeMode } = useTheme();
    const colors = useThemeColors();
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeSelect = (newTheme: ThemeMode) => {
      setThemeMode(newTheme);
      setIsOpen(false);
    };

    const filteredThemes = Object.values(themes);

    if (variant === 'select') {
      return (
        <select
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
          className={`px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        >
          {filteredThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.emoji} {theme.name}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="relative">
        {/* Toggle Button */}
        <button
          ref={ref}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${className}`}
          style={{
            backgroundColor: colors.surface + 'CC',
            borderColor: colors.border,
            color: colors.text
          }}
        >
          <span className="text-lg">{currentTheme.emoji}</span>
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
              className="fixed inset-0 z-[90]" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-cat-200/50 shadow-magic z-[100] overflow-hidden">
              <div className="p-3">
                <div className="text-xs font-medium mb-3 px-2 text-gray-600">
                  Tema Seç
                </div>
                
                <div className="space-y-1">
                  {filteredThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id as ThemeMode)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-left border-2 ${
                        themeMode === theme.id
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md'
                          : 'hover:bg-gray-50 border-transparent'
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
                        <span className="animate-wiggle">
                          {theme.emoji}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-gray-800">
                            {theme.name}
                          </span>
                          {themeMode === theme.id && (
                            <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded-full">
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
);

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
