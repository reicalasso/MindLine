import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, Theme, themes } from '../types/theme';

interface ThemeContextType {
  currentTheme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'mindline-theme';
const DEFAULT_THEME: ThemeMode = 'cyberpunk';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME);

  // LocalStorage'den tema yükle
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (savedTheme && themes[savedTheme]) {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      console.error('Tema yüklenirken hata:', error);
    }
  }, []);

  // Tema değiştiğinde localStorage'a kaydet
  const setThemeMode = (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Tema kaydedilirken hata:', error);
    }
  };

  // Tema toggle fonksiyonu (sırayla döner)
  const toggleTheme = () => {
    const themeKeys = Object.keys(themes) as ThemeMode[];
    const currentIndex = themeKeys.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setThemeMode(themeKeys[nextIndex]);
  };

  const currentTheme = themes[themeMode];
  const availableThemes = Object.values(themes);

  // CSS custom properties'i güncelle
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;
    
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-border', colors.border);
    
    // Body'ye tema class'ı ekle
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '') + ` theme-${themeMode}`;
  }, [currentTheme, themeMode]);

  const value: ThemeContextType = {
    currentTheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    availableThemes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
