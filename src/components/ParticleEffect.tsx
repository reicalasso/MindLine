import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useTheme();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (currentTheme.id !== 'cyberpunk') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system for cyberpunk theme
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
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 100;
        
        const colors = ['#00ffff', '#ff0080', '#00ff41', '#8000ff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 2 + 1;
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
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Data stream particles
    class DataStream {
      x!: number;
      y!: number;
      speed!: number;
      length!: number;
      color!: string;
      chars!: string[];
      charIndex!: number;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = -100;
        this.speed = Math.random() * 3 + 2;
        this.length = Math.random() * 20 + 10;
        this.color = '#00ff41';
        this.chars = '01'.split('');
        this.charIndex = 0;
      }

      update() {
        if (!canvas) return false;
        this.y += this.speed;
        this.charIndex = (this.charIndex + 1) % this.chars.length;
        return this.y < canvas.height + 100;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.font = '12px Courier New';
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        
        for (let i = 0; i < this.length; i++) {
          const alpha = 1 - (i / this.length);
          ctx.globalAlpha = alpha * 0.8;
          const char = this.chars[(this.charIndex + i) % this.chars.length];
          ctx.fillText(char, this.x, this.y - (i * 15));
        }
        
        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    const dataStreams: DataStream[] = [];
    const maxParticles = 50;
    const maxDataStreams = 15;

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    // Initialize data streams
    for (let i = 0; i < maxDataStreams; i++) {
      dataStreams.push(new DataStream());
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      
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

      // Update and draw data streams
      for (let i = dataStreams.length - 1; i >= 0; i--) {
        const stream = dataStreams[i];
        if (!stream.update()) {
          dataStreams.splice(i, 1);
          dataStreams.push(new DataStream());
        } else {
          stream.draw();
        }
      }

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
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
