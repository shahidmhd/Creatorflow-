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

    // Mouse tracking for interactive neural connections
    const mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Synapse Nodes
    interface SynapseNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
      pulseSpeed: number;
      colorIndex: number;
    }

    const nodeCount = Math.min(54, Math.max(28, Math.floor(width / 32)));
    const nodes: SynapseNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.5 + 2.0,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.015,
        colorIndex: i % 3,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.008;
      const isDark = document.documentElement.classList.contains("dark");

      ctx.clearRect(0, 0, width, height);

      // Colors configuration: Electric Cyan, Royal Blue & Silver/Slate
      const cyanStroke = isDark ? "rgba(56, 189, 248, 0.22)" : "rgba(2, 132, 199, 0.18)";
      const blueStroke = isDark ? "rgba(99, 102, 241, 0.18)" : "rgba(30, 41, 59, 0.14)";
      const silverStroke = isDark ? "rgba(226, 232, 240, 0.18)" : "rgba(100, 116, 139, 0.16)";

      // 1. Draw flowing neural sine waves
      const waveCount = 4;
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = w === 1 ? 1.75 : 1.2;
        ctx.strokeStyle = w % 2 === 0 ? cyanStroke : blueStroke;

        const yOffset = (height / (waveCount + 1)) * (w + 1);
        const amplitude = 34 + w * 14;
        const speed = time * (0.7 + w * 0.12);

        ctx.moveTo(0, yOffset + Math.sin(speed) * amplitude);

        for (let x = 0; x <= width; x += 35) {
          const y =
            yOffset +
            Math.sin(x * 0.0025 + speed) * amplitude +
            Math.cos(x * 0.0012 - speed * 0.6) * (amplitude * 0.35);
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 2. Update and draw floating neural nodes & connections
      const maxConnectDist = 175;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges smoothly
        if (node.x < -10) node.x = width + 10;
        else if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        else if (node.y > height + 10) node.y = -10;

        // Draw connections between nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * (isDark ? 0.36 : 0.24);
            ctx.beginPath();
            ctx.lineWidth = 0.95;
            ctx.strokeStyle =
              node.colorIndex === 0
                ? isDark
                  ? `rgba(56, 189, 248, ${alpha})`
                  : `rgba(2, 132, 199, ${alpha})`
                : node.colorIndex === 1
                ? isDark
                  ? `rgba(168, 85, 247, ${alpha})`
                  : `rgba(99, 102, 241, ${alpha})`
                : isDark
                ? `rgba(255, 255, 255, ${alpha * 0.85})`
                : `rgba(100, 116, 139, ${alpha})`;

            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }

        // Draw interactive connection to mouse cursor
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < mouse.radius) {
          const mAlpha = (1 - mDist / mouse.radius) * (isDark ? 0.55 : 0.38);
          ctx.beginPath();
          ctx.lineWidth = 1.35;
          ctx.strokeStyle = isDark
            ? `rgba(56, 189, 248, ${mAlpha})`
            : `rgba(2, 132, 199, ${mAlpha})`;
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Draw pulsing neural node
        node.phase += node.pulseSpeed;
        const pulse = Math.sin(node.phase) * 0.35 + 0.95;
        const currentRadius = node.radius * pulse;

        const nodeColor =
          node.colorIndex === 0
            ? isDark
              ? "rgba(56, 189, 248, 0.95)"
              : "rgba(2, 132, 199, 0.9)"
            : node.colorIndex === 1
            ? isDark
              ? "rgba(168, 85, 247, 0.95)"
              : "rgba(99, 102, 241, 0.9)"
            : isDark
            ? "rgba(255, 255, 255, 1.0)"
            : "rgba(15, 23, 42, 0.85)";

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isDark ? 12 : 5;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-500"
      aria-hidden="true"
    />
  );
}
