// How a student's space looks: an accent colour and a banner, picked from
// fixed presets (no uploads, so nothing to moderate or store). The UI owns
// what each banner looks like; the server only accepts known ids.

// Every accent has at least 4.5:1 contrast with white text (WCAG AA), so it
// works for buttons and badges on any of them.
export const ACCENT_COLORS = {
  purple: "#9C3FB5", // BEMS brand, default
  indigo: "#4F46E5",
  blue: "#2563EB",
  teal: "#0B7F75",
  green: "#23803F",
  amber: "#A85F00",
  rose: "#C2185B"
} as const;

export const BANNERS = ["aurora", "circuit", "sunrise", "midnight", "lagoon", "plain"] as const;

export type AccentColor = keyof typeof ACCENT_COLORS;
export type Banner = (typeof BANNERS)[number];

export const DEFAULT_ACCENT: AccentColor = "purple";
export const DEFAULT_BANNER: Banner = "aurora";

export function isAccentColor(v: unknown): v is AccentColor {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(ACCENT_COLORS, v);
}

export function isBanner(v: unknown): v is Banner {
  return typeof v === "string" && (BANNERS as readonly string[]).includes(v);
}

export function resolveAppearance(p: { accentColor: string | null; banner: string | null } | null) {
  const accent = isAccentColor(p?.accentColor) ? p!.accentColor as AccentColor : DEFAULT_ACCENT;
  const banner = isBanner(p?.banner) ? p!.banner as Banner : DEFAULT_BANNER;
  return { accentColor: accent, accentHex: ACCENT_COLORS[accent], banner };
}
