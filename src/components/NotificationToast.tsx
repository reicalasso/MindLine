import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const { currentTheme } = useTheme();

  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, autoClose, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          emoji: '✅',
          colors: currentTheme.id === 'cyberpunk' 
            ? 'text-green-400 border-green-400/30 bg-green-400/10' 
            : 'text-green-600 border-green-300 bg-green-50'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          emoji: '❌',
          colors: currentTheme.id === 'cyberpunk' 
            ? 'text-red-400 border-red-400/30 bg-red-400/10' 
            : 'text-red-600 border-red-300 bg-red-50'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          emoji: '⚠️',
          colors: currentTheme.id === 'cyberpunk' 
            ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' 
            : 'text-yellow-600 border-yellow-300 bg-yellow-50'
        };
      case 'info':
      default:
        return {
          icon: Info,
          emoji: 'ℹ️',
          colors: currentTheme.id === 'cyberpunk' 
            ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' 
            : 'text-blue-600 border-blue-300 bg-blue-50'
        };
    }
  };

  if (!isVisible) return null;

  const typeConfig = getTypeStyles();
  const Icon = typeConfig.icon;

  return (
    <div className={`
      fixed top-4 right-4 z-[9999] w-80 p-4 rounded-xl border-2 shadow-xl backdrop-blur-lg
      ${typeConfig.colors}
      ${currentTheme.id === 'cyberpunk' 
        ? 'bg-gray-900/95 shadow-neon-blue' 
        : 'bg-white/95 shadow-lg'
      }
      animate-in fade-in-50 slide-in-from-top-4 duration-300
    `}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {currentTheme.id === 'cyberpunk' ? (
            <div className="relative">
              <Icon className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 animate-ping opacity-30">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          ) : (
            <span className="text-lg">{typeConfig.emoji}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-semibold text-sm mb-1
            ${currentTheme.id === 'cyberpunk' ? 'font-mono tracking-wide' : ''}
          `}>
            {currentTheme.id === 'cyberpunk' && type === 'error' && '>>> SYSTEM_ERROR: '}
            {currentTheme.id === 'cyberpunk' && type === 'success' && '>>> PROCESS_COMPLETE: '}
            {currentTheme.id === 'cyberpunk' && type === 'warning' && '>>> WARNING: '}
            {currentTheme.id === 'cyberpunk' && type === 'info' && '>>> INFO: '}
            {title}
          </h4>
          {message && (
            <p className={`text-xs opacity-80 ${currentTheme.id === 'cyberpunk' ? 'font-mono' : ''}`}>
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`
            flex-shrink-0 p-1 rounded-full transition-all
            ${currentTheme.id === 'cyberpunk'
              ? 'text-cyber-secondary/70 hover:text-cyber-primary hover:bg-cyber-primary/10'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cyberpunk effects */}
      {currentTheme.id === 'cyberpunk' && (
        <>
          <div className="absolute top-0 right-0 w-1 h-1 bg-current opacity-0 animate-pulse" 
               style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-current opacity-20 animate-pulse" 
               style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className={`
          absolute bottom-0 left-0 h-1 rounded-b-xl transition-all ease-linear
          ${typeConfig.colors.includes('green') ? 'bg-green-400' :
            typeConfig.colors.includes('red') ? 'bg-red-400' :
            typeConfig.colors.includes('yellow') ? 'bg-yellow-400' : 'bg-blue-400'}
          opacity-30
        `} style={{
          width: '100%',
          animation: `shrink ${duration}ms linear`
        }} />
      )}
    </div>
  );
};

export default NotificationToast;

// CSS animation for progress bar
export const notificationStyles = `
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
`;