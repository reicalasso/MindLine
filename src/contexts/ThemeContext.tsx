import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, Theme, themes } from '../types/theme';

interface ThemeContextType {
  currentTheme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  availableThemes: Theme[];
  isThemeLoading: boolean;
  applyThemeVariables: (theme: Theme) => void;
  resetTheme: () => void;
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
  defaultTheme?: ThemeMode;
}

const THEME_STORAGE_KEY = 'mindline-theme';
const DEFAULT_THEME: ThemeMode = 'cat';

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // CSS değişkenlerini uygula
  const applyThemeVariables = (theme: Theme) => {
    const root = document.documentElement;
    
    // Renk değişkenleri
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
    
    // Tipografi değişkenleri
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    root.style.setProperty('--font-family-base', theme.typography.fontFamily);
    root.style.setProperty('--font-family-heading', theme.typography.fontFamilyHeading);
    root.style.setProperty('--font-family-mono', theme.typography.fontFamilyMono);
    
    // Spacing değişkenleri
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Animasyon değişkenleri
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });
    
    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });
    
    // Breakpoint değişkenleri
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      root.style.setProperty(`--breakpoint-${key}`, value);
    });
    
    // Özel CSS değişkenleri
    if (theme.cssVariables) {
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
    
    // Body'ye tema class'larını ekle
    const bodyClasses = document.body.className.split(' ').filter(cls => !cls.startsWith('theme-'));
    bodyClasses.push(`theme-${theme.id}`);
    document.body.className = bodyClasses.join(' ');
    
    // Meta theme-color tag'ını güncelle
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme.colors.primary;
      document.head.appendChild(meta);
    }
  };

  // LocalStorage'den tema yükle
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
        if (savedTheme && themes[savedTheme]) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.error('Tema yüklenirken hata:', error);
      } finally {
        setIsThemeLoading(false);
      }
    };
    
    loadTheme();
  }, []);

  // Tema değiştiğinde localStorage'a kaydet ve CSS değişkenlerini güncelle
  useEffect(() => {
    if (!isThemeLoading) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, themeMode);
        const currentTheme = themes[themeMode];
        applyThemeVariables(currentTheme);
      } catch (error) {
        console.error('Tema kaydedilirken hata:', error);
      }
    }
  }, [themeMode, isThemeLoading]);

  const setThemeMode = (mode: ThemeMode) => {
    if (themes[mode]) {
      setThemeModeState(mode);
    } else {
      console.warn(`Tema bulunamadı: ${mode}`);
    }
  };

  // Tema toggle fonksiyonu (sırayla döner)
  const toggleTheme = () => {
    const themeKeys = Object.keys(themes) as ThemeMode[];
    const currentIndex = themeKeys.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setThemeMode(themeKeys[nextIndex]);
  };

  // Temayı sıfırla
  const resetTheme = () => {
    setThemeMode(DEFAULT_THEME);
  };

  const currentTheme = themes[themeMode];
  const availableThemes = Object.values(themes);

  const value: ThemeContextType = {
    currentTheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    availableThemes,
    isThemeLoading,
    applyThemeVariables,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
