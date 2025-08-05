import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CyberEffectProps {
  className?: string;
}

interface Digit {
  id: number;
  x: number;
  y: number;
  char: string;
  speed: number;
  delay: number;
  opacity: number;
  color: string;
}

const CyberEffect: React.FC<CyberEffectProps> = ({ className = '' }) => {
  const { themeMode } = useTheme();
  const [digits, setDigits] = useState<Digit[]>([]);
  
  const createDigits = useCallback(() => {
    const possibleChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const colorOptions = ['#00f0ff', '#ff0055', '#c700ff'];
    const newDigits: Digit[] = [];
    
    // 20 dijital yağmur sütunu oluştur
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 100; // Rastgele yatay pozisyon (%)
      const delay = Math.random() * 5; // Rastgele başlangıç gecikmesi
      const speed = Math.random() * 2 + 1; // Rastgele düşüş hızı
      const opacity = Math.random() * 0.3 + 0.1; // Rastgele opaklık
      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      
      // Her sütun için 10-20 karakter oluştur
      const chars = Math.floor(Math.random() * 10) + 10;
      
      for (let j = 0; j < chars; j++) {
        const char = possibleChars[Math.floor(Math.random() * possibleChars.length)];
        const y = -100 + (j * -30); // Ekranın üstünden başla, her karakter arasında boşluk bırak
        
        newDigits.push({
          id: i * 100 + j,
          x,
          y,
          char,
          speed,
          delay: delay + (j * 0.1),
          opacity,
          color
        });
      }
    }
    
    setDigits(newDigits);
  }, []);
  
  useEffect(() => {
    if (themeMode === 'cyberpunk') {
      createDigits();
      
      // 30 saniyede bir yenile
      const refreshInterval = setInterval(createDigits, 30000);
      
      return () => {
        clearInterval(refreshInterval);
      };
    }
    return undefined; // Explicitly return undefined for non-cyberpunk themes
  }, [createDigits, themeMode]);

  // Cyberpunk temasında olmadığımızda bileşeni gösterme
  if (themeMode !== 'cyberpunk') {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-[2] overflow-hidden ${className}`}>
      {digits.map((digit) => (
        <div
          key={digit.id}
          className="absolute text-sm font-mono animate-digital-rain"
          style={{
            left: `${digit.x}%`,
            top: `${digit.y}%`,
            color: `${digit.color}${Math.round(digit.opacity * 255).toString(16).padStart(2, '0')}`,
            animationDuration: `${10 / digit.speed}s`,
            animationDelay: `${digit.delay}s`,
            textShadow: `0 0 5px ${digit.color}`
          }}
        >
          {digit.char}
        </div>
      ))}
      
      {/* Tarama çizgisi efekti */}
      <div className="cyber-scan-line-extreme"></div>
      
      {/* Veri akışı çizgileri */}
      <div className="cyber-decorations-extreme"></div>
      
      {/* Siber ızgara arka planı */}
      <div className="fixed inset-0 pointer-events-none z-[4] cyber-grid-background"></div>
      
      {/* Hologram efekti */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[6] opacity-5 animate-hologram-extreme overflow-hidden">
        <div className="w-[100vw] h-[100vh] border border-cyber-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] border border-cyber-secondary transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-[60vw] h-[60vh] border border-cyber-accent transform -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
      </div>
    </div>
  );
};

export default React.memo(CyberEffect);
