// Public portfolio: a page a student chooses to share, /u/<handle>, showing
// their earned badges, graded projects and certificates. Off until the
// student turns it on, and only for students with a confirmed registration
// (so nobody can sign up just to host a page on the BEMS domain).
//
// Privacy: the public page never includes email, phone, goals, "why I
// joined", streaks, tutor feedback or payment details. Project scores only
// appear if the student ticks "Show my scores". A turned-off, unknown or
// deactivated handle all look the same (404).

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { BADGES } from "@/lib/badges";
import { frontendUrl } from "@/lib/email";

export class PortfolioError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const HANDLE_RULES = { min: 3, max: 30 };
export const HEADLINE_MAX = 120;

// Addresses a student can't take: site pages and words that could pass for staff.
const RESERVED = new Set([
  "admin", "administrator", "api", "app", "bems", "bemsinstitute", "certificate", "certificates", "courses", "dashboard",
  "help", "home", "learn", "login", "logout", "me", "official", "register", "settings", "signup", "staff", "student",
  "students", "support", "team", "tutor", "tutors", "verify", "welcome", "www"
]);

/** Lowercase letters, numbers and single hyphens, 3–30 characters. Returns the error message, or null if fine. */
export function handleProblem(handle: string): string | null {
  if (handle.length < HANDLE_RULES.min || handle.length > HANDLE_RULES.max) {
    return `Your page address must be ${HANDLE_RULES.min} to ${HANDLE_RULES.max} characters.`;
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(handle)) {
    return "Use lowercase letters, numbers and single hyphens only (for example ada-obi).";
  }
  if (RESERVED.has(handle)) return "That address is reserved. Please choose another.";
  return null;
}

/** "Ada Obi" → "ada-obi" (falls back to "student" for names with no letters or numbers). */
export function suggestHandle(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, HANDLE_RULES.max)
    .replace(/-+$/g, "");
  return base.length >= HANDLE_RULES.min && !RESERVED.has(base) ? base : `${base || "student"}-bems`.slice(0, HANDLE_RULES.max);
}

/** Only http(s) links reach the public page (no javascript: or data: links). */
export function safeLink(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

async function buildPortfolio(userId: string, showScores: boolean) {
  const [user, enrollments, badges, submissions, certificates] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, avatarUrl: true } }),
    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { status: true, paymentStatus: true, course: { select: { id: true, title: true, slug: true, color: true } } }
    }),
    prisma.userBadge.findMany({ where: { userId }, orderBy: { earnedAt: "asc" } }),
    prisma.submission.findMany({
      where: { userId, status: "GRADED" },
      orderBy: { gradedAt: "desc" },
      select: {
        githubUrl: true, liveDemoUrl: true, score: true, gradedAt: true,
        assignment: { select: { title: true, type: true, course: { select: { title: true } } } }
      }
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      select: { certNumber: true, gradeTitle: true, issuedAt: true, course: { select: { title: true } } }
    })
  ]);

  const certifiedTitles = new Set(certificates.map((c) => c.course.title));
  const badgeDefs = new Map(BADGES.map((b) => [b.id, b]));
  return {
    name: user.name.trim(),
    avatarUrl: safeLink(user.avatarUrl),
    tracks: enrollments.filter(hasCourseAccess).map((e) => ({
      title: e.course.title,
      slug: e.course.slug,
      color: e.course.color,
      status: certifiedTitles.has(e.course.title) || e.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS"
    })),
    badges: badges.flatMap((b) => {
      const def = badgeDefs.get(b.badgeId);
      return def ? [{ id: def.id, title: def.title, description: def.description, icon: def.icon, earnedAt: b.earnedAt }] : [];
    }),
    // Graded work only: the tutor has looked at it.
    projects: submissions.map((s) => ({
      title: s.assignment.title,
      type: s.assignment.type,
      courseTitle: s.assignment.course.title,
      githubUrl: safeLink(s.githubUrl),
      liveDemoUrl: safeLink(s.liveDemoUrl),
      score: showScores ? s.score : null,
      gradedAt: s.gradedAt
    })),
    certificates: certificates.map((c) => ({
      certNumber: c.certNumber,
      courseTitle: c.course.title,
      gradeTitle: c.gradeTitle,
      issuedAt: c.issuedAt,
      href: `/certificate/${c.certNumber}`
    }))
  };
}

/** The public page for a handle, or null (unknown, turned off, deactivated, not a student). */
export async function getPublicPortfolio(rawHandle: string) {
  const handle = rawHandle.trim().toLowerCase();
  if (handleProblem(handle)) return null;
  const profile = await prisma.learningProfile.findUnique({
    where: { portfolioHandle: handle },
    select: {
      userId: true, portfolioEnabled: true, portfolioHeadline: true, portfolioShowScores: true,
      user: { select: { role: true, deactivatedAt: true } }
    }
  });
  if (!profile?.portfolioEnabled || profile.user.role !== "STUDENT" || profile.user.deactivatedAt) return null;
  return {
    handle,
    headline: profile.portfolioHeadline,
    ...(await buildPortfolio(profile.userId, profile.portfolioShowScores))
  };
}

async function canHavePortfolio(userId: string): Promise<boolean> {
  const enrollments = await prisma.enrollment.findMany({ where: { userId }, select: { status: true, paymentStatus: true } });
  return enrollments.some(hasCourseAccess);
}

/** The student's own settings plus a preview of exactly what the public sees. */
export async function getPortfolioSettings(userId: string) {
  const [user, profile, eligible] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
    prisma.learningProfile.findUnique({
      where: { userId },
      select: { portfolioEnabled: true, portfolioHandle: true, portfolioHeadline: true, portfolioShowScores: true }
    }),
    canHavePortfolio(userId)
  ]);
  const handle = profile?.portfolioHandle ?? null;
  const showScores = profile?.portfolioShowScores ?? false;
  return {
    enabled: Boolean(profile?.portfolioEnabled),
    handle,
    headline: profile?.portfolioHeadline ?? null,
    showScores,
    suggestedHandle: handle ?? suggestHandle(user.name),
    url: handle ? frontendUrl(`/u/${handle}`) : null,
    // False until a registration is paid and confirmed.
    canEnable: eligible,
    preview: await buildPortfolio(userId, showScores)
  };
}

export interface PortfolioInput {
  enabled?: unknown;
  handle?: unknown;
  headline?: unknown;
  showScores?: unknown;
}

export async function savePortfolioSettings(userId: string, input: PortfolioInput) {
  const data: Prisma.LearningProfileUncheckedUpdateInput = {};

  if (input.handle !== undefined) {
    if (typeof input.handle !== "string") throw new PortfolioError("Enter a page address.");
    const handle = input.handle.trim().toLowerCase();
    const problem = handleProblem(handle);
    if (problem) throw new PortfolioError(problem);
    data.portfolioHandle = handle;
  }
  if (input.headline !== undefined) {
    if (input.headline !== null && typeof input.headline !== "string") throw new PortfolioError("Enter a short headline.");
    const headline = typeof input.headline === "string" ? input.headline.replace(/\s+/g, " ").trim() : "";
    if (headline.length > HEADLINE_MAX) throw new PortfolioError(`Keep your headline under ${HEADLINE_MAX} characters.`);
    data.portfolioHeadline = headline || null;
  }
  if (input.showScores !== undefined) {
    if (typeof input.showScores !== "boolean") throw new PortfolioError("Choose on or off for showing scores.");
    data.portfolioShowScores = input.showScores;
  }
  if (input.enabled !== undefined) {
    if (typeof input.enabled !== "boolean") throw new PortfolioError("Choose on or off for your public page.");
    if (input.enabled) {
      if (!(await canHavePortfolio(userId))) {
        throw new PortfolioError("Your public page opens once your registration is confirmed.", 403);
      }
      const existing = await prisma.learningProfile.findUnique({ where: { userId }, select: { portfolioHandle: true } });
      if (!data.portfolioHandle && !existing?.portfolioHandle) throw new PortfolioError("Choose your page address first.");
    }
    data.portfolioEnabled = input.enabled;
  }

  try {
    await prisma.learningProfile.upsert({
      where: { userId },
      update: data,
      create: { ...(data as Omit<Prisma.LearningProfileUncheckedCreateInput, "userId">), userId }
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new PortfolioError("That address is taken. Please choose another.", 409);
    }
    throw err;
  }
  return getPortfolioSettings(userId);
}
