import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isStaff, isAdmin } from "@/lib/api-auth";
import { mapAdminCourse } from "@/lib/lms-mappers";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const courses = await prisma.course.findMany({
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ courses: courses.map(mapAdminCourse) });
}

// Admin only: create a new course/workshop listing. Modules/lessons/quiz/
// assignment content is added separately — this just registers the course.
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const tutor = typeof body?.tutor === "string" ? body.tutor.trim() : "";
  const tutorRole = typeof body?.tutorRole === "string" ? body.tutorRole.trim() : "";
  const badge = typeof body?.badge === "string" ? body.badge.trim() : "New Track";
  const schedule = typeof body?.schedule === "string" ? body.schedule.trim() : "";
  const delivery = typeof body?.delivery === "string" ? body.delivery.trim() : "";
  const priceFull = Number(body?.priceFull) || 0;
  const priceParts = Number(body?.priceParts) || priceFull;
  const deposit = Number(body?.deposit) || 0;

  if (!title || !slug || !tutor) {
    return NextResponse.json({ error: "title, slug, and tutor are required." }, { status: 400 });
  }

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A course with that slug already exists." }, { status: 409 });
  }

  const course = await prisma.course.create({
    data: {
      slug,
      title,
      tutor,
      tutorRole,
      badge,
      schedule,
      delivery,
      duration: "3 Months",
      tagline: title,
      priceFull,
      priceParts,
      deposit,
      finalProject: "Capstone project (details to be added)",
      status: "UPCOMING"
    },
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    }
  });

  return NextResponse.json({ course: mapAdminCourse(course) });
}
