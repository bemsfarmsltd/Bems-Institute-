"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Runs the scroll reveal for the whole site (see src/app/motion.css and
// docs/motion.md). Pages only add data-reveal / data-reveal-group; this
// watches for them, including ones rendered later (tabs, fetched lists).
//
// State lives in data- attributes, not classes: React rewrites className on
// every re-render, which would hide a revealed card again.

const STAGGER_MS = 70;
const MAX_STAGGERED = 8;

function reveal(el: Element) {
  el.setAttribute("data-revealed", "");
  const delay = parseInt((el as HTMLElement).style.getPropertyValue("--reveal-delay")) || 0;
  // Once the entrance is over, hover effects shouldn't wait for the stagger.
  window.setTimeout(() => el.setAttribute("data-settled", ""), delay + 900);
}

// Only the first page load: what's already on screen then stays put instead
// of vanishing and animating back in (on a slow phone that would mean a
// blank hero for a moment). Later navigations do animate their content in.
let firstLoad = true;

function inViewport(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

// Touch press feedback. CSS :active is unreliable on phones (iOS Safari
// ignores it without a touch listener; Android applies it late or not at
// all on a quick tap), so a touch marks the element data-pressed directly.
// Mouse presses are left to :active.
const PRESSABLE = ".m-lift, .m-press, .m-pop";
const MIN_PRESS_MS = 150; // long enough to see the squash on a quick tap

function usePressFeedback() {
  useEffect(() => {
    let pressed: Element | null = null;
    let pressedAt = 0;
    let timer = 0;

    const clear = () => {
      window.clearTimeout(timer);
      pressed?.removeAttribute("data-pressed");
      pressed = null;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !(e.target instanceof Element)) return;
      const el = e.target.closest(PRESSABLE);
      if (!el || el.matches(":disabled, [aria-disabled='true']")) return;
      clear();
      pressed = el;
      pressedAt = performance.now();
      el.setAttribute("data-pressed", "");
    };
    // Tap released: keep the squash visible briefly, then spring back.
    const up = () => {
      if (!pressed) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(clear, Math.max(0, MIN_PRESS_MS - (performance.now() - pressedAt)));
    };

    const opts = { passive: true } as const;
    document.addEventListener("pointerdown", down, opts);
    document.addEventListener("pointerup", up, opts);
    // The browser took the touch for a scroll: no press.
    document.addEventListener("pointercancel", clear, opts);
    window.addEventListener("scroll", clear, { passive: true, capture: true });
    return () => {
      clear();
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", clear);
      window.removeEventListener("scroll", clear, { capture: true });
    };
  }, []);
}

export function MotionProvider() {
  const pathname = usePathname();
  usePressFeedback();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      // No animation: nothing is ever hidden (motion-ready is never set).
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    const tagGroups = () => {
      document.querySelectorAll("[data-reveal-group]").forEach((group) => {
        const kind = group.getAttribute("data-reveal-group") || "up";
        Array.from(group.children).forEach((child, i) => {
          if (child.hasAttribute("data-reveal-staggered")) return;
          child.setAttribute("data-reveal-staggered", "");
          if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", kind);
          (child as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(i, MAX_STAGGERED) * STAGGER_MS}ms`);
        });
      });
    };

    const scan = () => {
      tagGroups();
      document.querySelectorAll("[data-reveal]:not([data-revealed]):not([data-reveal-watched])").forEach((el) => {
        el.setAttribute("data-reveal-watched", "");
        io.observe(el);
      });
    };

    if (firstLoad) {
      firstLoad = false;
      tagGroups();
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (inViewport(el)) {
          el.setAttribute("data-revealed", "");
          el.setAttribute("data-settled", "");
        }
      });
    }
    root.classList.add("motion-ready");
    scan();
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
