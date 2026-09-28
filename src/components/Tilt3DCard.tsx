"use client";

import React, { useRef, useState } from "react";

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  dark?: boolean;
}

export function Tilt3DCard({
  children,
  className = "",
  maxTilt = 9,
  glowColor = "rgba(121, 40, 202, 0.22)",
  dark = false
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState(
    "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"
  );
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;

    const rotateY = ((x / rect.width - 0.5) * 2 * maxTilt).toFixed(2);
    const rotateX = ((0.5 - y / rect.height) * 2 * maxTilt).toFixed(2);

    setTransform(
      `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.012, 1.012, 1.012)`
    );
    setGlarePos({ x: pctX, y: pctY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition:
          glarePos.opacity === 0
            ? "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "transform 90ms linear"
      }}
      className={`group relative ${className}`}
    >
      {/* Dynamic Cursor-Following Specular Spotlight */}
      <div
        aria-hidden="true"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(460px circle at ${glarePos.x}% ${glarePos.y}%, ${glowColor}, transparent 65%)`
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-0"
      />

      {/* Specular Top-Edge Rim Highlight */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-6 top-0 h-px ${
          dark
            ? "bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-[#7928CA]/40 to-transparent"
        }`}
      />

      {/* 3D Preserved Content Layer */}
      <div style={{ transformStyle: "preserve-3d" }} className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
