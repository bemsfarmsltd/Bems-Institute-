import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { mapSubmission } from "@/lib/lms-mappers";
import { recordAssignmentSubmitted, touchLearningStreak } from "@/lib/learning-engine";
import { createNotification, notifyStaff } from "@/lib/notifications";

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

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: { select: { slug: true, title: true } } }
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

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

  await createNotification({
    userId: session.id,
    title: `Capstone Submitted: ${assignment.title}`,
    message: "Your repository has been placed in the instructor grading queue.",
    category: "GRADING",
    linkUrl: `/learn/${assignment.course.slug}/assignment/${assignmentId}`
  });

  await notifyStaff({
    title: `New Capstone Submission — ${session.name}`,
    message: `${session.name} submitted "${assignment.title}" (${assignment.course.title}) for review.`,
    category: "GRADING",
    linkUrl: "/instructor/grading"
  });

  return NextResponse.json({ submission: mapSubmission(submission) });
}
