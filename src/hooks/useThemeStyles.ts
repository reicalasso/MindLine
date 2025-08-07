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
      className: currentTheme.styles.button,
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
  
  return {
    primary: currentTheme.colors.primary,
    secondary: currentTheme.colors.secondary,
    accent: currentTheme.colors.accent,
    background: currentTheme.colors.background,
    surface: currentTheme.colors.surface,
    surfaceVariant: currentTheme.colors.surfaceVariant,
    text: currentTheme.colors.text,
    textSecondary: currentTheme.colors.textSecondary,
    textMuted: currentTheme.colors.textMuted,
    border: currentTheme.colors.border,
    borderLight: currentTheme.colors.borderLight,
    shadow: currentTheme.colors.shadow,
    success: currentTheme.colors.success,
    warning: currentTheme.colors.warning,
    error: currentTheme.colors.error,
    info: currentTheme.colors.info,
    
    // Gradient'ler
    primaryGradient: currentTheme.colors.primaryGradient,
    backgroundGradient: currentTheme.colors.backgroundGradient,
    accentGradient: currentTheme.colors.accentGradient,
  };
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
