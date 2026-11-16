// Milestone badges, earned from real activity only (never bought, never
// faked). Rules are pure functions of a student's stats; syncBadges records
// newly earned ones once (UserBadge unique per student+badge) and sends one
// notification each. Badges are private to the student for now.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export interface BadgeStats {
  lessonsCompleted: number;
  modulesCompleted: number;
  bestCoursePercent: number;
  coursesCompleted: number;
  longestDayStreak: number;
  weeksOnGoal: number; // weeks ever at or above the weekly goal
  bestWeeklyRun: number; // most weeks in a row at or above the goal
  projectsSubmitted: number;
  bestProjectScore: number | null;
  bestQuizScore: number | null;
  certificates: number;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string; // how to earn it, shown on locked badges too
  icon: string; // lucide icon name, a hint for the UI
  earned: (s: BadgeStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  { id: "first-lesson", title: "First Step", description: "Finish your first lesson", icon: "footprints", earned: (s) => s.lessonsCompleted >= 1 },
  { id: "module-complete", title: "Module Master", description: "Finish every lesson in a module", icon: "layers", earned: (s) => s.modulesCompleted >= 1 },
  { id: "halfway", title: "Halfway There", description: "Reach 50% of a course", icon: "flag", earned: (s) => s.bestCoursePercent >= 50 },
  { id: "course-complete", title: "All Lessons Done", description: "Finish every lesson in a course", icon: "book-check", earned: (s) => s.coursesCompleted >= 1 },
  { id: "streak-3", title: "On a Roll", description: "Study 3 days in a row", icon: "flame", earned: (s) => s.longestDayStreak >= 3 },
  { id: "streak-7", title: "Week Warrior", description: "Study 7 days in a row", icon: "flame", earned: (s) => s.longestDayStreak >= 7 },
  { id: "goal-week", title: "Goal Getter", description: "Hit your weekly study goal", icon: "target", earned: (s) => s.weeksOnGoal >= 1 },
  { id: "goal-3-weeks", title: "Consistency Champ", description: "Hit your weekly goal 3 weeks in a row", icon: "calendar-check", earned: (s) => s.bestWeeklyRun >= 3 },
  { id: "first-project", title: "Shipped It", description: "Submit your first project", icon: "rocket", earned: (s) => s.projectsSubmitted >= 1 },
  { id: "high-score", title: "Top Marks", description: "Score 85 or more on a graded project", icon: "star", earned: (s) => (s.bestProjectScore ?? 0) >= 85 },
  { id: "quiz-ace", title: "Quiz Ace", description: "Score 100% on a quiz", icon: "trophy", earned: (s) => (s.bestQuizScore ?? 0) >= 100 },
  { id: "certified", title: "Certified", description: "Earn your BEMS certificate", icon: "award", earned: (s) => s.certificates >= 1 }
];

/**
 * Records any newly earned badges (once each, safe under concurrent calls)
 * and notifies the student. Returns the ids awarded by this call.
 */
export async function awardBadges(userId: string, stats: BadgeStats): Promise<string[]> {
  const have = new Set((await prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map((b) => b.badgeId));
  const awarded: string[] = [];
  for (const badge of BADGES) {
    if (have.has(badge.id) || !badge.earned(stats)) continue;
    try {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    } catch (err) {
      // Another request awarded it first: not ours to announce.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue;
      throw err;
    }
    awarded.push(badge.id);
    await createNotification({
      userId,
      title: `Badge earned: ${badge.title}`,
      message: `${badge.description}. Nice work! See all your badges on your dashboard.`,
      category: "GAMIFICATION",
      linkUrl: "/dashboard"
    });
  }
  return awarded;
}

/** Every badge with the student's status, for the dashboard (locked ones show how to earn them). */
export async function listBadges(userId: string) {
  const rows = await prisma.userBadge.findMany({ where: { userId } });
  const byId = new Map(rows.map((r) => [r.badgeId, r]));
  return BADGES.map((b) => {
    const row = byId.get(b.id);
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      icon: b.icon,
      earned: Boolean(row),
      earnedAt: row?.earnedAt ?? null,
      isNew: Boolean(row && !row.seenAt)
    };
  });
}

/** The student has seen their new badges (after the dashboard celebrates them). */
export async function markBadgesSeen(userId: string): Promise<number> {
  const r = await prisma.userBadge.updateMany({ where: { userId, seenAt: null }, data: { seenAt: new Date() } });
  return r.count;
}
