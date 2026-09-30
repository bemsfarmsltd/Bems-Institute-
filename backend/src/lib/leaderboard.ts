import { prisma } from "@/lib/prisma";

// Level titles indexed by level number (1-based). The last entry repeats
// for any level beyond the ladder.
const LEVEL_TITLES = [
  "Lab Apprentice",
  "Lab Technician",
  "Lab Associate",
  "Senior Lab Apprentice",
  "Lab Specialist",
  "Lab Master"
];

function levelTitleFor(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1];
}

export const BADGE_DEFINITIONS: Record<string, { title: string; description: string; icon: string }> = {
  certified: { title: "Certified", description: "Earned a BEMS course certificate", icon: "award" },
  streak5: { title: "Consistent", description: "5+ day learning streak", icon: "flame" },
  streak14: { title: "Dedicated", description: "14+ day learning streak", icon: "flame" },
  completedTen: { title: "On a Roll", description: "Completed 10+ lessons", icon: "book-open" },
  perfectQuiz: { title: "Perfectionist", description: "Scored 100% on a quiz", icon: "star" }
};

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  track: string;
  xpPoints: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  badges: string[];
  badgesCount: number;
  isMe: boolean;
}

// XP is deliberately simple and derived entirely from real activity already
// tracked elsewhere in the app — not a spec, just a defensible formula:
// 15 XP per completed lesson, the BEST score per quiz (not summed across
// retries, so re-attempting doesn't inflate XP), and a flat 100 XP bonus per
// earned certificate (a course is "worth" a fixed bonus rather than also
// re-adding the graded capstone score, which would double-count the same
// achievement).
export async function computeLeaderboard(callerId: string): Promise<LeaderboardRow[]> {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      progress: { where: { isCompleted: true }, select: { id: true } },
      quizAttempts: { select: { quizId: true, score: true } },
      certificates: { select: { id: true } },
      learningProfile: { select: { learningStreak: true } },
      enrollments: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { course: { select: { title: true } } }
      }
    }
  });

  const rows: LeaderboardRow[] = students.map((student) => {
    const completedLessons = student.progress.length;

    const bestScorePerQuiz = new Map<string, number>();
    for (const attempt of student.quizAttempts) {
      const current = bestScorePerQuiz.get(attempt.quizId) ?? 0;
      if (attempt.score > current) bestScorePerQuiz.set(attempt.quizId, attempt.score);
    }
    const quizPoints = [...bestScorePerQuiz.values()].reduce((sum, score) => sum + score, 0);
    const hasPerfectQuiz = [...bestScorePerQuiz.values()].some((score) => score === 100);

    const certificateCount = student.certificates.length;
    const streakDays = student.learningProfile?.learningStreak ?? 0;

    const xpPoints = completedLessons * 15 + quizPoints + certificateCount * 100;
    const level = Math.floor(xpPoints / 250) + 1;

    const badges: string[] = [];
    if (certificateCount > 0) badges.push("certified");
    if (streakDays >= 5) badges.push("streak5");
    if (streakDays >= 14) badges.push("streak14");
    if (completedLessons >= 10) badges.push("completedTen");
    if (hasPerfectQuiz) badges.push("perfectQuiz");

    return {
      rank: 0,
      userId: student.id,
      name: student.name,
      track: student.enrollments[0]?.course.title ?? "Not enrolled yet",
      xpPoints,
      level,
      levelTitle: levelTitleFor(level),
      streakDays,
      badges,
      badgesCount: badges.length,
      isMe: student.id === callerId
    };
  });

  rows.sort((a, b) => b.xpPoints - a.xpPoints);
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  return rows;
}
