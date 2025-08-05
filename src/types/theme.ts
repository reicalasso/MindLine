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

export type ThemeMode = 'cat' | 'cyberpunk';

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
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Matrix Pro',
    emoji: '⚡',
    description: 'NEURAL_NETWORK: ACTIVATED // REALITY: HACKED',
    colors: {
      primary: '#00f0ff',
      secondary: '#ff0055',
      accent: '#c700ff',
      background: 'linear-gradient(135deg, #001133 0%, #0a0a15 25%, #1a0033 50%, #0a0a15 75%, #001133 100%)',
      surface: 'rgba(5, 20, 35, 0.9)',
      text: '#00f0ff',
      textSecondary: '#ff0055',
      border: '#00f0ff',
      gradient: 'bg-cyber-matrix-extreme',
      shadow: 'shadow-cyber-intense'
    },
    styles: {
      cardClass: 'cyber-card-extreme',
      buttonClass: 'cyber-button-extreme',
      inputClass: 'cyber-input-extreme',
      backgroundClass: 'bg-cyber-matrix-extreme',
      textClass: 'text-cyber-primary-extreme',
      decorationClass: 'cyber-decorations-extreme'
    },
    animations: {
      glitch: 'animate-glitch-extreme',
      neonFlicker: 'animate-neon-flicker-extreme',
      dataStream: 'animate-data-stream-extreme',
      pulse: 'animate-circuit-pulse-extreme',
      scan: 'animate-scan-line-extreme',
      hologram: 'animate-hologram-extreme'
    }
  }
};
