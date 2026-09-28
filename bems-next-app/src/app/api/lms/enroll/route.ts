import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

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
  const paymentMethod = body?.paymentMethod === "paystack" || body?.paymentMethod === "bank"
    ? body.paymentMethod
    : null;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required." }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        take: 1,
        include: { lessons: { orderBy: { order: "asc" }, take: 1, select: { id: true } } }
      }
    }
  });
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

  const firstLessonId = course.modules[0]?.lessons[0]?.id ?? "les-1";
  const paymentSummary =
    paymentMethod === "paystack" && amountPaid
      ? `Payment of ₦${amountPaid.toLocaleString()} confirmed via Paystack.`
      : paymentMethod === "bank"
      ? "Bank transfer logged (pending admin verification)."
      : "Your classroom access is now unlocked.";

  await createNotification({
    userId: session.id,
    title: `Enrolled in ${course.title}`,
    message: `${paymentSummary} Click to start Lesson 1.`,
    category: paymentMethod ? "PAYMENT" : "CLASS",
    linkUrl: `/learn/${course.slug}/${firstLessonId}`
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.id },
    select: { courseId: true }
  });

  return NextResponse.json({ enrolledCourseIds: enrollments.map((e) => e.courseId) });
}
