"use client";

import { useEffect, useState } from "react";

// Persists a small { id: boolean } map (wishlist hearts, bookmarks, etc.) to
// localStorage under `key`. This is a per-viewer convenience only — it never
// syncs across devices or users — so localStorage is the right store rather
// than a backend table.
export function useLocalStorageRecord(key: string): [Record<string, boolean>, (id: string) => void] {
  const [value, setValue] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage — start empty
    }
  }, [key]);

  const toggle = (id: string) => {
    setValue((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage unavailable (private browsing, quota, etc.) — keep the
        // in-memory toggle working for this session even if it can't persist
      }
      return next;
    });
  };

  return [value, toggle];
}
