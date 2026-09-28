import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapCourse, mapQuiz, mapAssignment, mapCertificate } from "@/lib/lms-mappers";

// Public: course catalog (content, not enrollment-gated) plus the full
// certificate registry, which is intentionally public — /verify and
// /certificate let anyone look up a credential by ID without signing in.
export async function GET() {
  const [courses, quizzes, assignments, certificates] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      include: { modules: { include: { lessons: true } } }
    }),
    prisma.quiz.findMany({ include: { questions: true } }),
    prisma.assignment.findMany(),
    prisma.certificate.findMany({
      include: { user: { select: { name: true } }, course: { select: { title: true } } }
    })
  ]);

  return NextResponse.json({
    courses: courses.map(mapCourse),
    quizzes: quizzes.map(mapQuiz),
    assignments: assignments.map(mapAssignment),
    certificates: certificates.map(mapCertificate)
  });
}
