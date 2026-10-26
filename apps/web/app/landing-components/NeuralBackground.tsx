"use client";

import { useEffect, useRef } from "react";

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Synapse Nodes
    interface SynapseNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
      colorIndex: number;
    }

    const nodeCount = Math.min(24, Math.floor(width / 50));
    const nodes: SynapseNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.5 + 2,
        phase: Math.random() * Math.PI * 2,
        colorIndex: i % 2,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      const isDark = document.documentElement.classList.contains("dark");

      ctx.clearRect(0, 0, width, height);

      // Colors configuration
      const cyanStroke = isDark ? "rgba(0, 240, 255, 0.22)" : "rgba(2, 132, 199, 0.15)";
      const violetStroke = isDark ? "rgba(139, 92, 246, 0.22)" : "rgba(99, 102, 241, 0.15)";
      const cyanGlow = isDark ? "rgba(0, 240, 255, 0.75)" : "rgba(2, 132, 199, 0.45)";
      const violetGlow = isDark ? "rgba(139, 92, 246, 0.75)" : "rgba(99, 102, 241, 0.45)";

      // Draw sweeping neural sine spline curves
      const waveCount = 5;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 0 || w === 2 ? 1.75 : 1;
        ctx.strokeStyle = w % 2 === 0 ? cyanStroke : violetStroke;

        const yOffset = (height / (waveCount + 1)) * (w + 1);
        const amplitude = 35 + w * 12;
        const speed = time * (0.8 + w * 0.15);

        ctx.moveTo(0, yOffset + Math.sin(speed) * amplitude);

        for (let x = 0; x <= width; x += 40) {
          const y =
            yOffset +
            Math.sin(x * 0.003 + speed) * amplitude +
            Math.cos(x * 0.0015 - speed * 0.7) * (amplitude * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Update and draw connecting synapse nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce from edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * (isDark ? 0.28 : 0.16);
            ctx.beginPath();
            ctx.lineWidth = 0.85;
            ctx.strokeStyle = node.colorIndex === 0 ? `rgba(0, 240, 255, ${alpha})` : `rgba(139, 92, 246, ${alpha})`;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw node pulse
        const pulse = Math.sin(time * 3 + node.phase) * 0.4 + 0.8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.colorIndex === 0 ? cyanGlow : violetGlow;
        ctx.shadowColor = node.colorIndex === 0 ? cyanGlow : violetGlow;
        ctx.shadowBlur = isDark ? 12 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90 transition-opacity duration-500"
      aria-hidden="true"
    />
  );
}
