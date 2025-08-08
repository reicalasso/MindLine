import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Tema stilleri için yardımcı hook
 */
export const useThemeStyles = () => {
  const { currentTheme } = useTheme();

  return {
    // Temel bileşen stilleri
    card: {
      className: currentTheme.styles.card,
      style: {
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
        color: currentTheme.colors.text,
      }
    },
    
    button: {
      base: currentTheme.styles.button.base,
      primary: currentTheme.styles.button.primary,
      secondary: currentTheme.styles.button.secondary,
      style: {
        backgroundColor: currentTheme.colors.primary,
        color: currentTheme.colors.surface,
      }
    },
    
    input: {
      className: currentTheme.styles.input,
      style: {
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
        color: currentTheme.colors.text,
      }
    },
    
    modal: {
      className: currentTheme.styles.modal,
      style: {
        backgroundColor: currentTheme.colors.surface,
        borderColor: currentTheme.colors.border,
      }
    },
    
    // Metin stilleri
    heading: {
      className: currentTheme.styles.heading,
      style: {
        color: currentTheme.colors.text,
        fontFamily: currentTheme.typography.fontFamilyHeading,
      }
    },
    
    text: {
      className: currentTheme.styles.text,
      style: {
        color: currentTheme.colors.text,
        fontFamily: currentTheme.typography.fontFamily,
      }
    },
    
    textMuted: {
      className: currentTheme.styles.textMuted,
      style: {
        color: currentTheme.colors.textMuted,
      }
    },
    
    // Layout stilleri
    container: {
      className: currentTheme.styles.container,
    },
    
    background: {
      className: currentTheme.styles.background,
      style: {
        background: currentTheme.colors.backgroundGradient,
      }
    },
    
    // Yardımcı fonksiyonlar
    getColorWithOpacity: (color: string, opacity: number) => {
      // Örneğin, theme context’de tanımlı renk değeri "#f21c1cff" yerine
      // CSS değişkenimiz üzerinden dinamik değeri kullanabiliriz.
      return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
    },
    
    // CSS değişkenleri
    cssVars: {
      '--theme-primary': currentTheme.colors.primary,
      '--theme-secondary': currentTheme.colors.secondary,
      '--theme-accent': currentTheme.colors.accent,
      '--theme-background': currentTheme.colors.background,
      '--theme-surface': currentTheme.colors.surface,
      '--theme-text': currentTheme.colors.text,
      '--theme-text-secondary': currentTheme.colors.textSecondary,
      '--theme-border': currentTheme.colors.border,
      '--font-family': currentTheme.typography.fontFamily,
      '--font-family-heading': currentTheme.typography.fontFamilyHeading,
    },
  };
};

/**
 * Tema durumsal renkleri için hook
 */
export const useThemeColors = () => {
  const { currentTheme } = useTheme();
  
  return useMemo(() => {
    const colors = currentTheme.colors;
    
    // Pre-calculate frequently used color variations for better performance
    const optimizedColors = {
      ...colors,
      // Pre-calculated alpha variations
      surfaceAlpha50: colors.surface + '80',
      surfaceAlpha70: colors.surface + 'B3',
      surfaceAlpha90: colors.surface + 'E6',
      shadowAlpha20: colors.shadow + '33',
      shadowAlpha30: colors.shadow + '4D',
      borderAlpha40: colors.border + '66',
      borderAlpha30: colors.border + '4D',
      primaryAlpha10: colors.primary + '1A',
      primaryAlpha20: colors.primary + '33',
      primaryAlpha40: colors.primary + '66'
    };
    
    return optimizedColors;
  }, [currentTheme.id]); // Only recalculate when theme actually changes
};

/**
 * Tema animasyonları için hook
 */
export const useThemeAnimations = () => {
  const { currentTheme } = useTheme();
  
  return {
    duration: currentTheme.animations.duration,
    easing: currentTheme.animations.easing,
    custom: currentTheme.animations.custom || {},
  };
};

/**
 * Tema geçiş efektleri için hook
 */
export const useThemeTransition = (duration = 300) => {
  const { currentTheme, setThemeMode } = useTheme();
  
  const transitionWithEffect = (newTheme: string) => {
    // Geçiş efekti ekle
    document.body.style.transition = `all ${duration}ms ease`;
    
    // Temayı değiştir
    setThemeMode(newTheme as any);
    
    // Geçiş tamamlandıktan sonra transition'ı kaldır
    setTimeout(() => {
      document.body.style.transition = '';
    }, duration);
  };
  
  return {
    transitionWithEffect,
    currentTheme,
  };
};

// Performance optimized styles hook
export const useOptimizedStyles = () => {
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  
  return useMemo(() => ({
    // Optimized backdrop styles
    backdrop: {
      backgroundColor: colors.surfaceAlpha90,
      backdropFilter: 'blur(8px) saturate(150%)',
      WebkitBackdropFilter: 'blur(8px) saturate(150%)',
      borderColor: colors.borderAlpha40,
      willChange: 'transform',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden'
    },
    
    // Optimized card styles
    card: {
      backgroundColor: colors.surfaceAlpha70,
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderColor: colors.borderAlpha30,
      boxShadow: `0 8px 32px ${colors.shadowAlpha20}`,
      willChange: 'transform',
      transform: 'translateZ(0)'
    },
    
    // Optimized button styles
    button: {
      background: colors.primaryGradient,
      color: 'white',
      willChange: 'transform',
      transform: 'translateZ(0)'
    },
    
    // Mobile optimized styles
    mobileOptimized: window.innerWidth <= 768 ? {
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)'
    } : {}
    
  }), [currentTheme.id, colors]);
};
