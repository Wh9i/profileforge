"use client";

import { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
  color?: string;
  count?: number;
}

export function ParticleBackground({ color = "#6366f1", count = 50 }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [color, count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}

interface MouseEffectProps {
  effect: string;
  color?: string;
}

export function MouseEffectLayer({ effect, color = "#6366f1" }: MouseEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trails = useRef<{ x: number; y: number; life: number }[]>([]);

  useEffect(() => {
    if (effect === "NONE") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onMove = (e: MouseEvent) => {
      if (effect === "TRAIL" || effect === "SPARKLE") {
        trails.current.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (trails.current.length > 30) trails.current.shift();
      }
      if (effect === "RIPPLE") {
        trails.current.push({ x: e.clientX, y: e.clientY, life: 1 });
      }
    };

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trails.current = trails.current.filter((t) => {
        t.life -= 0.03;
        if (t.life <= 0) return false;

        if (effect === "TRAIL") {
          ctx.beginPath();
          ctx.arc(t.x, t.y, 4 * t.life, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = t.life * 0.5;
          ctx.fill();
        } else if (effect === "SPARKLE") {
          ctx.beginPath();
          ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.globalAlpha = t.life;
          ctx.fill();
        } else if (effect === "RIPPLE") {
          ctx.beginPath();
          ctx.arc(t.x, t.y, 20 * (1 - t.life), 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = t.life * 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        return true;
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
    };
  }, [effect, color]);

  if (effect === "NONE") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
