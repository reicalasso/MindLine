import { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyboardShortcut } from '../types';

interface UseKeyboardShortcutsReturn {
  shortcuts: KeyboardShortcut[];
  isShortcutModalOpen: boolean;
  openShortcutModal: () => void;
  closeShortcutModal: () => void;
}

export const useKeyboardShortcuts = (): UseKeyboardShortcutsReturn => {
  const navigate = useNavigate();
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);

  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: 'h',
      ctrl: true,
      description: 'Ana sayfaya git',
      action: () => navigate('/')
    },
    {
      key: 'l',
      ctrl: true,
      description: 'Mektuplar sayfasına git',
      action: () => navigate('/letters')
    },
    {
      key: 'c',
      ctrl: true,
      description: 'Sohbet sayfasına git',
      action: () => navigate('/chat')
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Filmler sayfasına git',
      action: () => navigate('/movies')
    },
    {
      key: 'u',
      ctrl: true,
      description: 'Müzik sayfasına git',
      action: () => navigate('/music')
    },
    {
      key: 't',
      ctrl: true,
      description: 'Yapılacaklar sayfasına git',
      action: () => navigate('/todos')
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Galeri sayfasına git',
      action: () => navigate('/gallery')
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Profil sayfasına git',
      action: () => navigate('/profile')
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Arama açılır menüsü',
      action: () => {
        // This will be implemented when search component is added
        console.log('Search shortcut triggered');
      }
    },
    {
      key: '?',
      shift: true,
      description: 'Klavye kısayollarını göster',
      action: () => setIsShortcutModalOpen(true)
    },
    {
      key: 'Escape',
      description: 'Modal veya overlay\'ları kapat',
      action: () => {
        setIsShortcutModalOpen(false);
        // Additional escape logic can be added here
      }
    }
  ], [navigate]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input, textarea, or contenteditable
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).contentEditable === 'true'
    ) {
      return;
    }

    const shortcut = shortcuts.find(s => {
      const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = s.alt ? event.altKey : !event.altKey;

      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isShortcutModalOpen,
    openShortcutModal: () => setIsShortcutModalOpen(true),
    closeShortcutModal: () => setIsShortcutModalOpen(false)
  };
};