'use client';

import React, { useRef, useEffect } from 'react';

const useAdvancedFireSystem = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let wind = 0;
    let mouse = { x: 0, y: 0, lastX: 0 };

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      life: number;
      heat: number;

      constructor() {
        this.x = 0;
        this.y = 0;
        this.size = 0;
        this.speedY = 0;
        this.life = 0;
        this.heat = 0;
        this.reset();
      }

      reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + Math.random() * 50;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 2 + 0.8;
        this.life = Math.random() * 0.8 + 0.2;
        this.heat = Math.random(); // 1 = Blanco, 0 = Rojo oscuro
      }

      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.y * 0.005) * 0.5 + wind;
        this.life -= 0.004;

        if (Math.random() > 0.98) this.size += 0.1;

        if (this.life <= 0 || this.y < -10) this.reset();
      }

      draw() {
        if (!ctx) return;
        const r = 255;
        const g = Math.floor(this.heat * 150);
        const b = Math.floor(this.heat * 50);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const count = window.innerWidth < 768 ? 60 : 150;
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };

    const animate = () => {
      if (!ctx) return;
      ctx.fillStyle = '#050201';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      wind *= 0.95;

      ctx.globalCompositeOperation = 'screen';
      particles.forEach(p => { p.update(); p.draw(); });
      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const dx = x - mouse.lastX;
      wind += dx * 0.005;
      mouse.lastX = x;
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          if (animationId) cancelAnimationFrame(animationId);
        }
        else animate();
      });
    });
    if (canvas) observer.observe(canvas);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    resize();
    init();
    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (canvas) observer.unobserve(canvas);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);
};


const FireflyBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useAdvancedFireSystem(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
    />
  );
};

export default FireflyBackground;
