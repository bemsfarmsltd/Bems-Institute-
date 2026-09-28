import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { mapSubmission } from "@/lib/lms-mappers";
import { recordAssignmentSubmitted, touchLearningStreak } from "@/lib/learning-engine";

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const assignmentId = typeof body?.assignmentId === "string" ? body.assignmentId : "";
  const githubUrl = typeof body?.githubUrl === "string" ? body.githubUrl.trim() : "";
  const liveDemoUrl = typeof body?.liveDemoUrl === "string" ? body.liveDemoUrl.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!assignmentId || !githubUrl) {
    return NextResponse.json(
      { error: "assignmentId and githubUrl are required." },
      { status: 400 }
    );
  }

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  // Resubmitting resets it back to SUBMITTED — a fresh resubmission needs
  // re-grading, it shouldn't keep a stale score/feedback from a prior pass.
  const submission = await prisma.submission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.id } },
    update: {
      githubUrl,
      liveDemoUrl: liveDemoUrl || null,
      notes: notes || null,
      status: "SUBMITTED",
      score: null,
      feedback: null,
      gradedBy: null,
      gradedAt: null
    },
    create: {
      assignmentId,
      userId: session.id,
      githubUrl,
      liveDemoUrl: liveDemoUrl || null,
      notes: notes || null,
      status: "SUBMITTED"
    },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { courseId: true } }
    }
  });

  await recordAssignmentSubmitted({
    userId: session.id,
    courseId: assignment.courseId,
    assignmentId
  });
  await touchLearningStreak(session.id);

  return NextResponse.json({ submission: mapSubmission(submission) });
}
