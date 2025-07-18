import React, { useEffect } from 'react';

export default function ParticleEffect() {
  useEffect(() => {
    const createParticle = () => {
      const particles = ['🐾', '💕', '✨', '💖', '🌟', '💫', '🦋', '🌸'];
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
      particle.style.fontSize = (Math.random() * 0.8 + 0.8) + 'rem';
      
      const particlesContainer = document.querySelector('.particles');
      if (particlesContainer) {
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 8000);
      }
    };

    const interval = setInterval(createParticle, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return <div className="particles"></div>;
}
