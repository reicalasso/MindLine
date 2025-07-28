import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useInterval } from '../hooks';

interface Particle {
  id: string;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  createdAt: number;
  opacity: number;
  rotation: number;
}

interface ParticleEffectProps {
  maxParticles?: number;
  spawnRate?: number;
  emojis?: string[];
  disabled?: boolean;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  maxParticles = 20,
  spawnRate = 2000,
  emojis = ['🐾', '💕', '😺', '🐱', '💖', '✨', '🌸', '💝', '😻', '💌', '🌟', '💫'],
  disabled = false
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleCounter = useRef(0);

  // Memoized emoji array to prevent unnecessary re-renders
  const particleEmojis = useMemo(() => emojis, [emojis]);

  // Create a new particle with random properties
  const createParticle = useCallback((): Particle => {
    const now = Date.now();
    particleCounter.current += 1;
    
    return {
      id: `particle-${now}-${particleCounter.current}`, // Ensure unique keys
      emoji: particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 8 + Math.random() * 6, // 8-14 seconds
      size: 0.8 + Math.random() * 0.8, // 0.8-1.6rem
      createdAt: now,
      opacity: 0.2 + Math.random() * 0.3, // 0.2-0.5 opacity
      rotation: Math.random() * 360
    };
  }, [particleEmojis]);

  // Initialize particles on mount - fixed dependency array
  useEffect(() => {
    if (disabled) return;

    const initialParticles: Particle[] = [];
    const initialCount = Math.min(10, maxParticles);

    for (let i = 0; i < initialCount; i++) {
      initialParticles.push(createParticle());
    }

    setParticles(initialParticles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, maxParticles]); // Removed createParticle from dependencies to prevent infinite loop

  // Clean up expired particles and add new ones
  const updateParticles = useCallback(() => {
    if (disabled) return;

    setParticles(prevParticles => {
      const now = Date.now();
      
      // Remove expired particles
      const activeParticles = prevParticles.filter(
        particle => now - particle.createdAt < particle.duration * 1000
      );

      // Add new particle if under limit
      if (activeParticles.length < maxParticles) {
        const newParticle = createParticle();
        return [...activeParticles, newParticle];
      }

      return activeParticles;
    });
  }, [disabled, maxParticles, createParticle]);

  // Use custom interval hook for better performance
  useInterval(updateParticles, disabled ? null : spawnRate);

  // Clear particles when disabled
  useEffect(() => {
    if (disabled) {
      setParticles([]);
    }
  }, [disabled]);

  // Don't render anything if disabled
  if (disabled) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-particle-float will-change-transform"
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}rem`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            // Optimize for performance
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default React.memo(ParticleEffect);

// Export types for reuse
export type { Particle, ParticleEffectProps };
