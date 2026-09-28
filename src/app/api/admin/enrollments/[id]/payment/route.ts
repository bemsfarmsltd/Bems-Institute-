import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/api-auth";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  const amountPaid = Number(body?.amountPaid);

  if (status !== "PAID_FULL" && status !== "PARTIAL") {
    return NextResponse.json({ error: "status must be PAID_FULL or PARTIAL." }, { status: 400 });
  }
  if (!Number.isFinite(amountPaid) || amountPaid < 0) {
    return NextResponse.json({ error: "amountPaid must be a non-negative number." }, { status: 400 });
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { paymentStatus: status, amountPaid },
    include: { course: { select: { title: true, slug: true } } }
  });

  await createNotification({
    userId: enrollment.userId,
    title: `Payment Confirmed: ${enrollment.course.title}`,
    message: `BEMS Admissions verified ₦${amountPaid.toLocaleString()} (${status === "PAID_FULL" ? "Paid in Full" : "Installment Deposit"}).`,
    category: "PAYMENT",
    linkUrl: "/dashboard"
  });

  return NextResponse.json({ enrollment });
}
