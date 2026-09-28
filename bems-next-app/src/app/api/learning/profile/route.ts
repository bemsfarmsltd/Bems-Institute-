import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { getLearningProfile } from "@/lib/learning-engine";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await getLearningProfile(session.id);
  return NextResponse.json(profile);
}
