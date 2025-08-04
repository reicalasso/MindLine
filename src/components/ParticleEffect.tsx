import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Performans optimizasyonu: Eğer tema cyberpunk değilse animasyonu çalıştırmayalım
    if (currentTheme.id !== 'cyberpunk') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      // Performans için daha düşük çözünürlük kullanıyoruz
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Hafifletilmiş Particle sistemi
    class Particle {
      x!: number;
      y!: number;
      vx!: number;
      vy!: number;
      life!: number;
      maxLife!: number;
      color!: string;
      size!: number;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5; // Daha yavaş hareket
        this.vy = (Math.random() - 0.5) * 1.5; // Daha yavaş hareket
        this.life = 0;
        this.maxLife = Math.random() * 150 + 100; // Daha uzun ömür
        
        const colors = ['#00ffff', '#ff0080']; // Daha az renk çeşidi
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 1.5 + 0.5; // Daha küçük parçacıklar
      }

      update() {
        if (!canvas) return false;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;

        return this.life < this.maxLife;
      }

      draw() {
        if (!ctx) return;
        const alpha = 1 - (this.life / this.maxLife);
        ctx.globalAlpha = alpha * 0.5; // Daha az opaklık
        ctx.fillStyle = this.color;
        // Gölge efektini kaldırdık - performans iyileştirmesi
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Data akışı parçacıklarını kaldırdık - performans iyileştirmesi

    const particles: Particle[] = [];
    const maxParticles = 25; // Daha az parçacık

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    // Frame atlamalı animasyon için sayaç
    let frameSkip = 0;

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Her frame'i işleme almak yerine, bazı frame'leri atlıyoruz
      frameSkip++;
      if (frameSkip % 2 === 0) { // Her 2 frame'de bir render ediyoruz
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        if (!particle.update()) {
          particles.splice(i, 1);
          particles.push(new Particle());
        } else {
          particle.draw();
        }
      }

      // Parçacıklar arası bağlantıları sadece yakındakiler için yapıyoruz ve daha seyrek
      if (Math.random() > 0.7) { // Sadece %30 olasılıkla bağlantı çiziyoruz
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.lineWidth = 0.5; // Daha ince çizgiler
        
        for (let i = 0; i < particles.length; i += 2) { // Her ikinci parçacığı al (yarı yarıya azalt)
          for (let j = i + 2; j < particles.length; j += 2) { // Her ikinci parçacığı kontrol et
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) { // Daha kısa mesafede bağlantı
              ctx.globalAlpha = (80 - distance) / 80 * 0.2; // Daha az opaklık
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTheme.id]);

  if (currentTheme.id !== 'cyberpunk') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleEffect;
