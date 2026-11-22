// The one place the AI features get a track's tutor from: the course catalogue
// (each track has one tutor). The browser's tutor name is never trusted, so a
// stale or made-up name can't reach a prompt.

import { LMS_COURSES } from "@/data/lms-data";

// What each tutor is expert in, for the tutor's system instruction.
const EXPERTISE: Record<string, string> = {
  "web-dev": "Expert in semantic HTML5, CSS Grid/Flexbox, JavaScript ES6+, Next.js and API engineering.",
  "ai-automation": "Expert in LLMs, prompt engineering, Make/Zapier webhooks and AI agent workflows.",
  "product-design": "Expert in design thinking, Figma auto-layout, design systems and developer handoff.",
  cybersecurity: "Expert in network security, vulnerability scanning and defensive systems."
};

/**
 * Maps whatever the client sends (a course id, a slug, an old id like
 * "graphic-design", or a title like "UI/UX Design") to a real course id.
 * Falls back to web-dev.
 */
export function resolveTrackId(input: unknown): string {
  const raw = typeof input === "string" ? input.trim().toLowerCase() : "";
  const exact = LMS_COURSES.find((c) => c.id === raw || c.slug === raw);
  if (exact) return exact.id;
  if (/cyber|security/.test(raw)) return "cybersecurity";
  if (/design|\bui\b|\bux\b|figma/.test(raw)) return "product-design";
  if (/\bai\b|automation|artificial/.test(raw)) return "ai-automation";
  return "web-dev";
}

export interface TrackTutor {
  trackId: string;
  trackTitle: string;
  /** The name students see, e.g. "Mr. Victor" or "Specialist Faculty". */
  name: string;
  role: string;
  /** How the tutor refers to itself in a prompt (the Cybersecurity tutor's name isn't confirmed yet). */
  promptIdentity: string;
}

export function tutorForTrack(input: unknown): TrackTutor {
  const trackId = resolveTrackId(input);
  const course = LMS_COURSES.find((c) => c.id === trackId) ?? LMS_COURSES[0];
  const name = course.tutor;
  const role = course.tutorRole;
  const promptIdentity =
    name === "Specialist Faculty"
      ? `the BEMS ${course.title} tutor, ${role} at BEMS Institute of Technology (Umuahia). ${EXPERTISE[trackId] ?? ""}`
      : `${name}, ${role} at BEMS Institute of Technology (Umuahia). ${EXPERTISE[trackId] ?? ""}`;
  return { trackId, trackTitle: course.title, name, role, promptIdentity: promptIdentity.trim() };
}
