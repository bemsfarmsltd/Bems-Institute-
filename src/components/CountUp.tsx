"use client";

import { useEffect, useRef, useState } from "react";

// A number that counts up from 0 the first time it scrolls into view, for
// stat tiles ("1,240 students", "₦4.2m"). The real value is what's rendered
// on the server, for reduced-motion visitors, and after the count finishes
// (so a live data refresh shows straight away).
export function CountUp({
  value,
  duration = 1200,
  format = (n: number) => n.toLocaleString("en-NG"),
  className
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Fraction of the count shown, 0..1; null when not animating.
  const [progress, setProgress] = useState<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        setProgress(t < 1 ? 1 - Math.pow(1 - t, 3) : null);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [duration]);

  return (
    <span ref={ref} className={className}>
      {format(progress === null ? value : Math.round(value * progress))}
    </span>
  );
}
