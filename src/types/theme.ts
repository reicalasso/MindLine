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
  };
}

export type ThemeMode = 'cat' | 'romantic' | 'magic' | 'fur' | 'pink' | 'cyberpunk';

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
  },
  romantic: {
    id: 'romantic',
    name: 'Romantik Tema',
    emoji: '💖',
    description: 'Aşk dolu romantik tema',
    colors: {
      primary: '#ef4444',
      secondary: '#f87171',
      accent: '#fca5a5',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 30%, #fecaca 70%, #fca5a5 100%)',
      surface: '#ffffff',
      text: '#7f1d1d',
      textSecondary: '#991b1b',
      border: '#f87171',
      gradient: 'bg-romantic-gradient',
      shadow: 'shadow-romantic'
    },
    styles: {
      cardClass: 'romantic-card',
      buttonClass: 'love-button',
      inputClass: 'romantic-input',
      backgroundClass: 'bg-romantic-gradient',
      textClass: 'text-romantic-700',
      decorationClass: 'love-decoration-1 love-decoration-2 love-decoration-3'
    }
  },
  magic: {
    id: 'magic',
    name: 'Büyülü Tema',
    emoji: '✨',
    description: 'Büyülü mor tema',
    colors: {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#e9d5ff',
      background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #e9d5ff 100%)',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#c084fc',
      gradient: 'bg-magic-gradient',
      shadow: 'shadow-magic'
    },
    styles: {
      cardClass: 'magic-card',
      buttonClass: 'magic-button',
      inputClass: 'magic-input',
      backgroundClass: 'bg-magic-gradient',
      textClass: 'text-magic-700',
      decorationClass: 'magic-decoration-1 magic-decoration-2'
    }
  },
  pink: {
    id: 'pink',
    name: 'Pembe Tema',
    emoji: '🌸',
    description: 'Tatlı pembe tema',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#f9a8d4',
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f9a8d4 75%, #f472b6 100%)',
      surface: '#ffffff',
      text: '#831843',
      textSecondary: '#9d174d',
      border: '#f472b6',
      gradient: 'bg-pink-gradient',
      shadow: 'shadow-paw'
    },
    styles: {
      cardClass: 'pink-card',
      buttonClass: 'paw-button',
      inputClass: 'pink-input',
      backgroundClass: 'bg-pink-gradient',
      textClass: 'text-paw-700',
      decorationClass: 'paw-decoration-1 paw-decoration-2'
    }
  },
  fur: {
    id: 'fur',
    name: 'Doğal Tema',
    emoji: '🤎',
    description: 'Doğal gri-kahve tema',
    colors: {
      primary: '#6b7280',
      secondary: '#9ca3af',
      accent: '#d1d5db',
      background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#374151',
      border: '#9ca3af',
      gradient: 'bg-fur-gradient',
      shadow: 'shadow-soft'
    },
    styles: {
      cardClass: 'fur-card',
      buttonClass: 'fur-button',
      inputClass: 'fur-input',
      backgroundClass: 'bg-fur-gradient',
      textClass: 'text-fur-700',
      decorationClass: 'fur-decoration-1'
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Matrix',
    emoji: '🕶️',
    description: 'Fütüristik cyberpunk tema',
    colors: {
      primary: '#00ffff',
      secondary: '#ff0080',
      accent: '#00ff41',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0033 50%, #001122 100%)',
      surface: 'rgba(0, 255, 255, 0.1)',
      text: '#00ffff',
      textSecondary: '#ff0080',
      border: '#00ff41',
      gradient: 'bg-cyber-gradient',
      shadow: 'shadow-cyber'
    },
    styles: {
      cardClass: 'cyber-card',
      buttonClass: 'btn-cyber',
      inputClass: 'cyber-input',
      backgroundClass: 'bg-cyber-matrix',
      textClass: 'text-cyber-primary',
      decorationClass: 'cyber-decorations'
    },
    animations: {
      glitch: 'animate-glitch',
      neonFlicker: 'animate-neon-flicker',
      dataStream: 'animate-data-stream',
      pulse: 'animate-cyber-pulse'
    }
  }
};
