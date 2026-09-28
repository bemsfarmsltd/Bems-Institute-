"use client";

import React, { useEffect, useRef } from "react";

interface SpatialBackgroundProps {
  variant?: "light" | "dark";
  className?: string;
}

interface Vec4 {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface SpatialNode {
  baseX: number;
  baseY: number;
  z: number;
  phase: number;
  speed: number;
  hue: number;
}

// Generate the 16 vertices of a 4D Hypercube (Tesseract) in [-1, 1]^4
const TESSERACT_VERTICES: Vec4[] = [];
for (let i = 0; i < 16; i++) {
  TESSERACT_VERTICES.push({
    x: i & 1 ? 1 : -1,
    y: i & 2 ? 1 : -1,
    z: i & 4 ? 1 : -1,
    w: i & 8 ? 1 : -1
  });
}

// Generate the 32 edges connecting vertices that differ by exactly 1 bit
const TESSERACT_EDGES: [number, number][] = [];
for (let i = 0; i < 16; i++) {
  for (let j = i + 1; j < 16; j++) {
    const diff = i ^ j;
    if (diff && (diff & (diff - 1)) === 0) {
      TESSERACT_EDGES.push([i, j]);
    }
  }
}

function rotate4D(v: Vec4, angleXW: number, angleYW: number, angleZW: number, angleXY: number): Vec4 {
  let { x, y, z, w } = v;

  // Rotate in XW plane (4th dimension rotation)
  const cosXW = Math.cos(angleXW);
  const sinXW = Math.sin(angleXW);
  const x1 = x * cosXW - w * sinXW;
  const w1 = x * sinXW + w * cosXW;
  x = x1;
  w = w1;

  // Rotate in YW plane (4th dimension rotation)
  const cosYW = Math.cos(angleYW);
  const sinYW = Math.sin(angleYW);
  const y1 = y * cosYW - w * sinYW;
  const w2 = y * sinYW + w * cosYW;
  y = y1;
  w = w2;

  // Rotate in ZW plane (4th dimension rotation)
  const cosZW = Math.cos(angleZW);
  const sinZW = Math.sin(angleZW);
  const z1 = z * cosZW - w * sinZW;
  const w3 = z * sinZW + w * cosZW;
  z = z1;
  w = w3;

  // Rotate in XY plane (3D rotation)
  const cosXY = Math.cos(angleXY);
  const sinXY = Math.sin(angleXY);
  const x2 = x * cosXY - y * sinXY;
  const y2 = x * sinXY + y * cosXY;

  return { x: x2, y: y2, z, w: w3 };
}

export function SpatialBackground({ variant = "light", className = "" }: SpatialBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Cursor tracking with smooth spring damping
    const mouse = { x: width * 0.65, y: height * 0.45, targetX: width * 0.65, targetY: height * 0.45 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Create 3D spatial wave nodes
    const nodeCount = 42;
    const nodes: SpatialNode[] = Array.from({ length: nodeCount }, (_, i) => ({
      baseX: (i % 7) / 6,
      baseY: Math.floor(i / 7) / 5,
      z: 0.3 + ((i * 17) % 100) / 100,
      phase: (i * 0.75) % (Math.PI * 2),
      speed: 0.4 + ((i * 13) % 50) / 100,
      hue: i % 2 === 0 ? 270 : 215 // Brand purple (270) & Electric blue (215)
    }));

    let time = 0;

    const render = () => {
      time += 0.011;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const normMouseX = (mouse.x / Math.max(width, 1) - 0.5) * 2;
      const normMouseY = (mouse.y / Math.max(height, 1) - 0.5) * 2;

      // 1. Ambient Cursor Spotlight Glow
      const spotlightRadius = Math.max(width, height) * 0.42;
      const spotGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        spotlightRadius
      );
      if (variant === "dark") {
        spotGrad.addColorStop(0, "rgba(121, 40, 202, 0.22)");
        spotGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.08)");
        spotGrad.addColorStop(1, "rgba(11, 8, 29, 0)");
      } else {
        spotGrad.addColorStop(0, "rgba(121, 40, 202, 0.11)");
        spotGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.05)");
        spotGrad.addColorStop(1, "rgba(250, 248, 255, 0)");
      }
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render 3D Spatial Neural Wave Field (X, Y, Z + Time t)
      const projectedNodes: { x: number; y: number; scale: number; hue: number }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const waveZ = Math.sin(time * n.speed + n.phase) * 0.28 + n.z;
        const depthScale = 1 / (1.55 - waveZ * 0.6);

        const rawX = n.baseX * width + Math.cos(time * 0.7 + n.phase) * 28;
        const rawY = n.baseY * height + Math.sin(time * 0.8 + n.phase) * 24;

        // Parallax shift from cursor + 3D depth
        const parallaxX = (rawX - width * 0.5) * (depthScale * 0.14) - normMouseX * 26 * waveZ;
        const parallaxY = (rawY - height * 0.5) * (depthScale * 0.14) - normMouseY * 26 * waveZ;

        const px = rawX + parallaxX;
        const py = rawY + parallaxY;

        projectedNodes.push({ x: px, y: py, scale: depthScale, hue: n.hue });
      }

      // Connect nearby 3D nodes with depth-faded synaptic lines
      const maxDist = Math.min(width, height) * 0.26;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const a = projectedNodes[i];
          const b = projectedNodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (variant === "dark" ? 0.22 : 0.13);
            ctx.strokeStyle =
              variant === "dark"
                ? `rgba(168, 85, 247, ${alpha.toFixed(3)})`
                : `rgba(121, 40, 202, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw glowing 3D nodes
      for (const p of projectedNodes) {
        const radius = Math.max(1.5, p.scale * 2.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle =
          variant === "dark"
            ? `hsla(${p.hue}, 90%, 72%, 0.55)`
            : `hsla(${p.hue}, 78%, 52%, 0.28)`;
        ctx.fill();
      }

      // 3. Render Rotating 4D Tesseract (Hypercube projected 4D -> 3D -> 2D)
      const centerX = width > 900 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.48;
      const tesseractSize = Math.min(width, height) * 0.23;

      const angleXW = time * 0.55 + normMouseX * 0.65;
      const angleYW = time * 0.42 + normMouseY * 0.65;
      const angleZW = time * 0.31;
      const angleXY = time * 0.25;

      const projectedTesseract = TESSERACT_VERTICES.map((v) => {
        const r = rotate4D(v, angleXW, angleYW, angleZW, angleXY);
        // Stereographic projection from 4D (w) to 3D
        const distance4D = 2.65;
        const wFactor = 1 / (distance4D - r.w);
        const x3 = r.x * wFactor;
        const y3 = r.y * wFactor;
        const z3 = r.z * wFactor;

        // Perspective projection from 3D (z) to 2D screen
        const distance3D = 3.1;
        const zFactor = 1 / (distance3D - z3);

        return {
          x: centerX + x3 * zFactor * tesseractSize * 3.1,
          y: centerY + y3 * zFactor * tesseractSize * 3.1,
          depth: wFactor * zFactor,
          w: r.w
        };
      });

      // Draw Tesseract edges with 4D W-dimension color interpolation
      for (const [i, j] of TESSERACT_EDGES) {
        const p1 = projectedTesseract[i];
        const p2 = projectedTesseract[j];
        const avgW = (p1.w + p2.w) * 0.5;
        const isInnerCell = avgW > 0;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (variant === "dark") {
          ctx.strokeStyle = isInnerCell
            ? "rgba(56, 189, 248, 0.34)"
            : "rgba(168, 85, 247, 0.26)";
          ctx.lineWidth = isInnerCell ? 1.5 : 1.1;
        } else {
          ctx.strokeStyle = isInnerCell
            ? "rgba(59, 130, 246, 0.22)"
            : "rgba(121, 40, 202, 0.18)";
          ctx.lineWidth = isInnerCell ? 1.4 : 1;
        }
        ctx.stroke();
      }

      // Draw Tesseract vertices
      for (const pt of projectedTesseract) {
        const r = Math.max(2, pt.depth * 9.5);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle =
          variant === "dark"
            ? pt.w > 0
              ? "rgba(56, 189, 248, 0.75)"
              : "rgba(192, 132, 252, 0.6)"
            : pt.w > 0
            ? "rgba(59, 130, 246, 0.45)"
            : "rgba(121, 40, 202, 0.4)";
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [variant]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Architectural perspective grid */}
      <div
        className={`absolute inset-0 ${
          variant === "dark" ? "bg-spatial-grid-dark" : "bg-spatial-grid-light"
        } [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]`}
      />

      {/* Ambient 4D Aurora Orbs */}
      <div
        className={`animate-aurora-pulse absolute -top-28 -right-20 h-[480px] w-[480px] rounded-full blur-3xl ${
          variant === "dark"
            ? "bg-radial from-[#7928CA]/30 via-[#3B82F6]/15 to-transparent"
            : "bg-radial from-[#7928CA]/18 via-[#3B82F6]/10 to-transparent"
        }`}
      />
      <div
        className={`animate-aurora-pulse absolute -bottom-28 -left-20 h-[440px] w-[440px] rounded-full blur-3xl ${
          variant === "dark"
            ? "bg-radial from-[#3B82F6]/25 via-[#10B981]/10 to-transparent"
            : "bg-radial from-[#3B82F6]/14 via-[#7928CA]/08 to-transparent"
        }`}
      />

      {/* Interactive 4D Hypercube + 3D Neural Field Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
