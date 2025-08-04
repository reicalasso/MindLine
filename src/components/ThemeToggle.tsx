import { useState } from 'react';
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

  const filteredThemes = availableThemes.filter(theme => theme.id === 'cyberpunk' || theme.id === 'cat');

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
          <div className={`absolute right-0 top-full mt-2 w-64 backdrop-blur-xl rounded-2xl border-2 z-50 overflow-hidden ${
            currentTheme.id === 'cyberpunk' 
              ? 'bg-cyber-50/95 border-cyber-primary shadow-neon-blue' 
              : 'bg-white/95 border-cat-200/50 shadow-magic'
          }`}>
            <div className="p-3">
              <div className={`text-xs font-medium mb-3 px-2 ${
                currentTheme.id === 'cyberpunk' 
                  ? 'text-cyber-primary font-mono' 
                  : 'text-gray-600'
              }`}>
                {currentTheme.id === 'cyberpunk' ? 'SELECT_THEME.exe' : 'Tema Seç'}
              </div>
              
              <div className="space-y-1">
                {filteredThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id as ThemeMode)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-left border-2 ${
                      themeMode === theme.id
                        ? (currentTheme.id === 'cyberpunk' 
                          ? 'bg-cyber-red border-cyber-primary' 
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md')
                        : (currentTheme.id === 'cyberpunk'
                          ? 'hover:bg-cyber-100 border-cyber-accent/30 hover:border-cyber-secondary' 
                          : 'hover:bg-gray-50 border-transparent')
                    } ${theme.id === 'cyberpunk' ? 'animate-circuit-pulse' : ''}`}
                  >
                    {/* Tema önizleme kutusu */}
                    <div 
                      className={`w-8 h-8 rounded-lg border-2 shadow-sm flex items-center justify-center text-lg ${
                        theme.id === 'cyberpunk' ? 'border-cyber-primary' : 'border-white'
                      }`}
                      style={{ 
                        background: theme.id === 'cyberpunk' 
                          ? 'linear-gradient(135deg, #001122, #1a0033)' 
                          : (theme.colors.background.includes('gradient') 
                            ? `linear-gradient(135deg, ${theme.colors.primary}40, ${theme.colors.secondary}40)`
                            : theme.colors.background)
                      }}
                    >
                      <span className={`animate-wiggle ${theme.id === 'cyberpunk' ? 'text-cyber-primary' : ''}`}>
                        {theme.emoji}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-sm ${
                          currentTheme.id === 'cyberpunk' 
                            ? 'text-cyber-primary font-mono' 
                            : 'text-gray-800'
                        }`}>
                          {theme.name}
                        </span>
                        {themeMode === theme.id && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            currentTheme.id === 'cyberpunk'
                              ? 'bg-cyber-red text-cyber-primary font-mono'
                              : 'bg-purple-200 text-purple-800'
                          }`}>
                            {currentTheme.id === 'cyberpunk' ? 'ACTIVE' : 'Aktif'}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${
                        currentTheme.id === 'cyberpunk' 
                          ? 'text-cyber-secondary font-mono' 
                          : 'text-gray-600'
                      }`}>
                        {theme.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Theme info - simplified animations */}
              <div className={`mt-3 p-3 rounded-xl border ${
                currentTheme.id === 'cyberpunk' 
                  ? 'bg-gradient-to-r from-cyber-matrix/50 to-cyber-red/30 border-cyber-primary/50' 
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">
                    {currentTheme.id === 'cyberpunk' ? '⚡' : '✨'}
                  </span>
                  <span className={`text-xs font-medium ${
                    currentTheme.id === 'cyberpunk' 
                      ? 'text-cyber-primary font-mono' 
                      : 'text-purple-800'
                  }`}>
                    {currentTheme.id === 'cyberpunk' ? 'ACTIVE_THEME.exe' : 'Şu anki tema'}
                  </span>
                </div>
                <p className={`text-xs ${
                  currentTheme.id === 'cyberpunk' 
                    ? 'text-cyber-accent font-mono' 
                    : 'text-purple-700'
                }`}>
                  <span className="font-medium">{currentTheme.name}</span> - {currentTheme.description}
                </p>
                {currentTheme.id === 'cyberpunk' && (
                  <>
                    <div className="mt-2 text-xs text-cyber-secondary font-mono opacity-70">
                      &gt; Neural_interface.connected()
                    </div>
                    <div className="mt-1 text-xs text-cyber-accent font-mono opacity-60">
                      &gt; Performance_mode.enabled
                    </div>
                    <div className="mt-1 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                      <span className="text-xs text-cyber-green font-mono">OPTIMIZED</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
