import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { KeyboardShortcut } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Modal from './ui/Modal';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts
}) => {
  const { currentTheme } = useTheme();

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key);
    return keys.join(' + ');
  };

  // Group shortcuts by category
  const navigationShortcuts = shortcuts.filter(s => 
    s.description.includes('sayfasına git') || s.description.includes('Ana sayfaya')
  );
  const actionShortcuts = shortcuts.filter(s => 
    !s.description.includes('sayfasına git') && !s.description.includes('Ana sayfaya')
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Klavye Kısayolları"
      size="md"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Keyboard className={`w-6 h-6 ${currentTheme.colors.text}`} />
          <p className={`text-sm ${currentTheme.styles.textClass} opacity-75`}>
            Bu kısayollar ile uygulamada daha hızlı gezinebilirsiniz
          </p>
        </div>

        <div className="space-y-6">
          {/* Navigation Shortcuts */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${currentTheme.styles.textClass} flex items-center gap-2`}>
              🧭 Navigasyon
            </h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    currentTheme.id === 'cyberpunk' 
                      ? 'bg-gray-900/50 border border-cyber-primary/20' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <span className={`text-sm ${currentTheme.styles.textClass}`}>
                    {shortcut.description}
                  </span>
                  <kbd className={`
                    px-3 py-1 text-xs font-mono rounded border
                    ${currentTheme.id === 'cyberpunk'
                      ? 'bg-cyber-primary text-black border-cyber-secondary animate-neon-flicker-lite'
                      : 'bg-white border-gray-300 text-gray-700'
                    }
                    shadow-sm
                  `}>
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Action Shortcuts */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${currentTheme.styles.textClass} flex items-center gap-2`}>
              ⚡ Hızlı İşlemler
            </h3>
            <div className="space-y-2">
              {actionShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    currentTheme.id === 'cyberpunk' 
                      ? 'bg-gray-900/50 border border-cyber-primary/20' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <span className={`text-sm ${currentTheme.styles.textClass}`}>
                    {shortcut.description}
                  </span>
                  <kbd className={`
                    px-3 py-1 text-xs font-mono rounded border
                    ${currentTheme.id === 'cyberpunk'
                      ? 'bg-cyber-primary text-black border-cyber-secondary animate-neon-flicker-lite'
                      : 'bg-white border-gray-300 text-gray-700'
                    }
                    shadow-sm
                  `}>
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          currentTheme.id === 'cyberpunk' 
            ? 'bg-cyber-primary/10 border border-cyber-primary/20' 
            : 'bg-blue-50'
        } flex items-start gap-3`}>
          <div className="text-lg">💡</div>
          <div className={`text-sm ${currentTheme.styles.textClass}`}>
            <strong>İpucu:</strong> Bu kısayollar metin kutularında yazerken çalışmaz. 
            Kısayolları kullanmak için sayfa üzerinde herhangi bir yere tıklayın.
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${currentTheme.id === 'cyberpunk'
                ? 'bg-cyber-primary text-black hover:bg-cyber-secondary animate-neon-flicker-lite'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            <X className="w-4 h-4" />
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KeyboardShortcutsModal;