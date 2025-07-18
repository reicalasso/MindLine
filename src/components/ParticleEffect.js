import React, { useEffect, useState } from 'react';

export default function ParticleEffect() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const emojis = ['🐾', '💕', '😺', '🐱', '💖', '✨', '🌸', '💝'];
    
    const createParticle = () => {
      return {
        id: Math.random(),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 4,
        size: 0.8 + Math.random() * 0.6
      };
    };

    // İlk parçacıkları oluştur
    const initialParticles = Array.from({ length: 15 }, createParticle);
    setParticles(initialParticles);

    // Yeni parçacıklar ekle
    const interval = setInterval(() => {
      setParticles(prevParticles => {
        const newParticles = prevParticles.filter(p => Date.now() - p.createdAt < p.duration * 1000);
        
        if (newParticles.length < 20) {
          const newParticle = {
            ...createParticle(),
            createdAt: Date.now()
          };
          newParticles.push(newParticle);
        }
        
        return newParticles;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-particle-float opacity-30"
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}rem`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}
