import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeStyles';
import { performanceUtils } from '../utils/performance';

interface OptimizedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function OptimizedBackground({ children, className = '' }: OptimizedBackgroundProps) {
  const { currentTheme } = useTheme();
  const colors = useThemeColors();
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsLowEnd(performanceUtils.isLowEndDevice());
    setReducedMotion(performanceUtils.prefersReducedMotion());
  }, []);

  // Skull Bunny teması için özel optimizasyon
  if (currentTheme.id === 'skull-bunny') {
    const backgroundStyle = {
      background: reducedMotion || isLowEnd 
        ? 'linear-gradient(180deg, #0B0B0D 0%, #1E1E22 100%)'
        : `linear-gradient(180deg, rgba(11, 11, 13, 0.9) 0%, rgba(30, 30, 34, 0.85) 100%), url('/images/skull-bunny-bg.jpg') center/cover no-repeat ${window.innerWidth <= 768 ? 'scroll' : 'fixed'}`,
      minHeight: '100vh',
      position: 'relative' as const,
      willChange: 'transform',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden' as const
    };

    const patternOverlayStyle = reducedMotion || isLowEnd ? { display: 'none' } : {
      content: '""',
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%231E1E22' fill-opacity='${window.innerWidth <= 768 ? '0.05' : '0.08'}'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat`,
      pointerEvents: 'none' as const,
      zIndex: 1,
      opacity: window.innerWidth <= 768 ? 0.1 : 0.2,
      willChange: 'opacity',
      transform: 'translateZ(0)'
    };

    return (
      <div style={backgroundStyle} className={className}>
        {!reducedMotion && !isLowEnd && (
          <div style={patternOverlayStyle} />
        )}
        <div style={{ position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </div>
    );
  }

  // Diğer temalar için normal arkaplan
  return (
    <div 
      style={{ 
        background: colors.backgroundGradient,
        minHeight: '100vh'
      }} 
      className={className}
    >
      {children}
    </div>
  );
}
