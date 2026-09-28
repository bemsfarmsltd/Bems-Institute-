import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { mapSubmission, mapCertificate } from "@/lib/lms-mappers";
import { createNotification } from "@/lib/notifications";

const CERT_PREFIX_BY_COURSE: Record<string, string> = {
  "web-dev": "WD",
  "ai-automation": "AI",
  "product-design": "UX",
  cybersecurity: "SEC"
};

function gradeTitleFor(score: number): string {
  if (score >= 90) return "Distinction (90%+)";
  if (score >= 75) return "Credit (75%+)";
  return "Pass";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!session || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Instructor access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const score = Number(body?.score);
  const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: "score must be a number between 0 and 100." }, { status: 400 });
  }

  const existing = await prisma.submission.findUnique({
    where: { id },
    include: {
      assignment: {
        select: { id: true, title: true, courseId: true, course: { select: { slug: true, title: true } } }
      }
    }
  });
  if (!existing) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      score,
      feedback: feedback || null,
      status: "GRADED",
      gradedBy: session.name,
      gradedAt: new Date()
    },
    include: {
      user: { select: { name: true, email: true } },
      assignment: { select: { courseId: true } }
    }
  });

  await createNotification({
    userId: existing.userId,
    title: `Capstone Graded: ${score}/100`,
    message: feedback
      ? `${session.name}: "${feedback}"`
      : `${session.name} graded "${existing.assignment.title}" (${score}/100).`,
    category: "GRADING",
    linkUrl: `/learn/${existing.assignment.course.slug}/assignment/${existing.assignment.id}`
  });

  let certificate = null;
  if (score >= 70) {
    const courseId = existing.assignment.courseId;
    const prefix = CERT_PREFIX_BY_COURSE[courseId] || "TECH";
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const certNumber = `BEMS-CERT-2026-${prefix}-${randomCode}`;

    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: existing.userId, courseId } },
      update: {},
      create: {
        certNumber,
        userId: existing.userId,
        courseId,
        gradeTitle: gradeTitleFor(score),
        finalScore: score,
        qrVerifyUrl: `/verify/${certNumber}`
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      }
    });
    certificate = mapCertificate(cert);

    await createNotification({
      userId: existing.userId,
      title: `Certificate Issued: ${cert.course.title}`,
      message: `Congratulations! Credential ${cert.certNumber} (${cert.gradeTitle}) is ready to view and download.`,
      category: "GRADING",
      linkUrl: `/certificate/${cert.id}`
    });
  }

  return NextResponse.json({ submission: mapSubmission(updated), certificate });
}
