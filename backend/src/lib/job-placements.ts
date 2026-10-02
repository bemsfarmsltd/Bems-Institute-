import { prisma } from "@/lib/prisma";

// PRD §6.2: "Finished -> help into a job" — finishing a course (earning a
// Certificate) adds the graduate to the job-help pipeline automatically.
// Upsert, not create: a re-grade that re-issues the same cert must not
// reset an already-further-along placement back to SEEKING.
export async function ensurePlacementSeeking(userId: string, courseId: string): Promise<void> {
  await prisma.jobPlacement.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {},
    create: { userId, courseId, status: "SEEKING" }
  });
}
