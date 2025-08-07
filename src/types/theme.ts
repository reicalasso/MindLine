export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
  shadow: string;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  description: string;
  colors: ThemeColors;
  styles: {
    cardClass: string;
    buttonClass: string;
    inputClass: string;
    backgroundClass: string;
    textClass: string;
    decorationClass: string;
  };
  animations?: {
    glitch?: string;
    neonFlicker?: string;
    dataStream?: string;
    pulse?: string;
    scan?: string;
    hologram?: string;
  };
}

export type ThemeMode = 'cat';

export const themes: Record<ThemeMode, Theme> = {
  cat: {
    id: 'cat',
    name: 'Kedili Tema',
    emoji: '😺',
    description: 'Sevimli kedi teması',
    colors: {
      primary: '#f21c1cff',
      secondary: '#f8b668',
      accent: '#fbd2a2',
      background: 'linear-gradient(135deg, #fef7ee 0%, #fde8d1 30%, #fbd2a2 70%, #f8b668 100%)',
      surface: '#ffffff',
      text: '#374151',
      textSecondary: '#6b7280',
      border: '#f8b668',
      gradient: 'bg-cat-gradient',
      shadow: 'shadow-cat'
    },
    styles: {
      cardClass: 'cat-card',
      buttonClass: 'cat-button',
      inputClass: 'cat-input',
      backgroundClass: 'bg-cat-gradient',
      textClass: 'text-cat-700',
      decorationClass: 'cat-decoration-1 cat-decoration-2 cat-decoration-3'
    }
  }
};
