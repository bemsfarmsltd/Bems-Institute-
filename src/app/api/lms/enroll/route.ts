import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";

type DeliveryMode = "PHYSICAL_LAB" | "VIRTUAL_ZOOM";

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const courseId = typeof body?.courseId === "string" ? body.courseId : "";
  const source = typeof body?.source === "string" && body.source.trim() ? body.source.trim() : "website";
  const deliveryMode: DeliveryMode = body?.deliveryMode === "VIRTUAL_ZOOM" ? "VIRTUAL_ZOOM" : "PHYSICAL_LAB";
  const paymentPlan = body?.paymentPlan === "installment" ? "installment" : "full";
  // "paystack" simulates an instant successful charge (this app has no real
  // payment gateway wired up); "bank" records a pending manual transfer that
  // an admin confirms later via /api/admin/enrollments/:id/payment. Omitting
  // paymentMethod (the plain "Instant Demo Enroll" button) leaves payment
  // untouched/pending, same as before this endpoint took payment info.
  const paymentMethod = body?.paymentMethod === "paystack" || body?.paymentMethod === "bank"
    ? body.paymentMethod
    : null;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const totalDue = paymentPlan === "installment" ? course.priceParts : course.priceFull;
  let amountPaid: number | undefined;
  let paymentStatus: "PENDING" | "PARTIAL" | "PAID_FULL" | undefined;

  if (paymentMethod === "paystack") {
    amountPaid = paymentPlan === "installment" ? course.deposit : totalDue;
    paymentStatus = amountPaid >= totalDue ? "PAID_FULL" : "PARTIAL";
  } else if (paymentMethod === "bank") {
    amountPaid = 0;
    paymentStatus = "PENDING";
  }

  const activeCohort = await prisma.cohort.findFirst({ orderBy: { createdAt: "desc" } });

  const baseData = {
    source,
    deliveryMode,
    paymentPlan,
    totalDue,
    ...(amountPaid !== undefined ? { amountPaid } : {}),
    ...(paymentStatus !== undefined ? { paymentStatus } : {}),
    ...(activeCohort ? { cohortId: activeCohort.id } : {})
  };

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.id, courseId } },
    update: baseData,
    create: { userId: session.id, courseId, status: "ACTIVE", ...baseData }
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.id },
    select: { courseId: true }
  });

  return NextResponse.json({ enrolledCourseIds: enrollments.map((e) => e.courseId) });
}
