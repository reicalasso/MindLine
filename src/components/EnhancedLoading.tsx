import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface EnhancedLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'pulse' | 'spinner';
  className?: string;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  message = '',
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const { currentTheme } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-2xl';
      case 'lg': return 'text-8xl';
      default: return 'text-6xl';
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'sm': return 'min-h-[20vh]';
      case 'lg': return 'min-h-[80vh]';
      default: return 'min-h-[40vh]';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className={`flex space-x-1 ${size === 'sm' ? 'scale-75' : ''}`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full animate-bounce ${
                currentTheme.id === 'cyberpunk' 
                  ? 'bg-cyber-primary shadow-neon-blue' 
                  : 'bg-pink-400'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        {message && (
          <span className={`text-sm ${currentTheme.styles.textClass} animate-pulse`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${getContainerSize()} ${className}`}>
        <div className={`relative ${getSizeClasses()}`}>
          <div className={`animate-pulse ${currentTheme.id === 'cyberpunk' ? 'text-cyber-primary' : 'text-pink-400'}`}>
            💓
          </div>
          <div className="absolute inset-0 animate-ping">
            <div className={`w-full h-full rounded-full ${
              currentTheme.id === 'cyberpunk' 
                ? 'bg-cyber-primary/20' 
                : 'bg-pink-200'
            }`}></div>
          </div>
        </div>
        {message && (
          <p className={`${currentTheme.styles.textClass} font-elegant text-center animate-bounce`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center space-y-4 ${getContainerSize()} ${className}`}>
        <div className="relative">
          <div className={`
            animate-spin rounded-full border-4 border-t-transparent
            ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'}
            ${currentTheme.id === 'cyberpunk'
              ? 'border-cyber-primary shadow-neon-blue'
              : 'border-pink-400'
            }
          `}></div>
          <div className={`
            absolute inset-0 animate-ping rounded-full border-2
            ${currentTheme.id === 'cyberpunk'
              ? 'border-cyber-secondary/30'
              : 'border-pink-200'
            }
          `}></div>
        </div>
        {message && (
          <p className={`${currentTheme.styles.textClass} font-elegant text-center`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Default variant with enhanced animations
  return (
    <div className={`flex flex-col items-center justify-center space-y-6 ${getContainerSize()} ${className}`}>
      <div className="relative">
        {currentTheme.id === 'cyberpunk' ? (
          <div className="relative animate-float">
            <div className={`${getSizeClasses()} animate-neon-flicker-extreme text-cyber-primary-extreme`}>⚡</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-glitch-extreme text-cyber-secondary-extreme">⚙️</div>
            <div className="cyber-scan-line-extreme"></div>
            
            {/* Circuit pattern background */}
            <div className="absolute inset-0 -z-10">
              <div className="w-20 h-20 border border-cyber-primary/20 animate-pulse"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border border-cyber-secondary/20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className={`${getSizeClasses()} animate-bounce-cat`}>😺</div>
            <div className="absolute -top-4 -right-4 text-3xl animate-float">✨</div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-pink-200 rounded-full blur-lg animate-pulse"></div>
            
            {/* Floating hearts */}
            <div className="absolute -top-8 -left-8 text-2xl animate-float opacity-60" style={{animationDelay: '1s'}}>💕</div>
            <div className="absolute -top-12 right-0 text-xl animate-float opacity-40" style={{animationDelay: '2s'}}>💖</div>
            <div className="absolute top-0 -right-8 text-lg animate-float opacity-50" style={{animationDelay: '1.5s'}}>💝</div>
          </div>
        )}
      </div>
      
      {/* Loading dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full animate-bounce ${
              currentTheme.id === 'cyberpunk' 
                ? 'bg-cyber-primary shadow-neon-blue' 
                : 'bg-pink-400'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      {/* Loading message */}
      <div className="text-center">
        <p className={`${currentTheme.id === 'cyberpunk' ? 'font-mono text-cyber-primary-extreme animate-neon-flicker-lite' : 'font-cat text-xl'} ${currentTheme.styles.textClass}`}>
          {message || (currentTheme.id === 'cyberpunk' ? 'LOADING_SEQUENCE: ACTIVE' : 'Kedili içerik yükleniyor...')}
        </p>
        
        {/* Loading progress bar */}
        <div className={`mt-4 w-32 h-1 rounded-full mx-auto overflow-hidden ${
          currentTheme.id === 'cyberpunk' ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div className={`h-full rounded-full animate-pulse ${
            currentTheme.id === 'cyberpunk' 
              ? 'bg-gradient-to-r from-cyber-primary to-cyber-secondary animate-circuit-pulse-extreme' 
              : 'bg-gradient-to-r from-pink-400 to-purple-500'
          }`} style={{
            animation: currentTheme.id === 'cyberpunk' 
              ? 'loading-bar-cyber 2s infinite' 
              : 'loading-bar 2s infinite'
          }}></div>
        </div>
      </div>
      
      {/* Additional decorative elements */}
      {currentTheme.id !== 'cyberpunk' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-pink-300 rounded-full animate-ping opacity-20" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-ping opacity-30" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-pink-200 rounded-full animate-ping opacity-15" style={{animationDelay: '2s'}}></div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLoading;