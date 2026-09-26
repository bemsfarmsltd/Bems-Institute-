import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public, fire-and-forget: logs a banner/QR landing-page visit so the admin
// analytics dashboard can compute real scan-to-registration conversion.
// Never blocks the visitor's page render — the caller doesn't need to wait
// on this beyond a normal fetch.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const source = typeof body?.source === "string" ? body.source.trim() : "";
  const courseId = typeof body?.courseId === "string" ? body.courseId : null;

  if (!source) {
    return NextResponse.json({ error: "source is required." }, { status: 400 });
  }

  await prisma.qrScan.create({ data: { source, courseId } });
  return NextResponse.json({ ok: true });
}
