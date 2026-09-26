import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/api-auth";
import { mapAdminCourse } from "@/lib/lms-mappers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (status !== "ACTIVE" && status !== "UPCOMING" && status !== "ARCHIVED") {
    return NextResponse.json({ error: "status must be ACTIVE, UPCOMING, or ARCHIVED." }, { status: 400 });
  }

  const course = await prisma.course.update({
    where: { id },
    data: { status },
    include: {
      modules: { include: { lessons: { select: { id: true } } } },
      _count: { select: { enrollments: true } }
    }
  });

  return NextResponse.json({ course: mapAdminCourse(course) });
}
