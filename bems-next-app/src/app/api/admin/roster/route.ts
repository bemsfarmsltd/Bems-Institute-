import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, isStaff } from "@/lib/api-auth";
import { computeAdminRoster } from "@/lib/admin-roster";

// Instructor/Admin only: one row per enrollment, with progress/quiz/capstone/
// certificate status computed from the real DB records built up over the
// enrollment's lifetime, not stored redundantly.
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return NextResponse.json({ error: "Staff access required." }, { status: 403 });
  }

  const roster = await computeAdminRoster();
  return NextResponse.json({ roster });
}
