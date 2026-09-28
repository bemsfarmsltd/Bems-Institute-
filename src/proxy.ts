import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// Real server-side gate for /instructor: runs before any page code, so it
// can't be bypassed by disabling client JS or editing localStorage. /admin
// is deliberately NOT redirected here — it's its own sign-in surface (the
// staff passcode form in AdminGate), so unauthenticated visitors need to
// reach the page to see it.
export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isAuthorized = session?.role === "INSTRUCTOR" || session?.role === "ADMIN";

  if (!isAuthorized) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/instructor/:path*"]
};
