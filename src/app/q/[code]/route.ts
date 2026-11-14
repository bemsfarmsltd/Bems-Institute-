import { NextResponse, type NextRequest } from "next/server";

// Short link printed in every custom campaign QR code (/q/<code>). The
// backend counts the scan and says where it goes (GET /api/qr/:code), so a
// printed code can be re-pointed from the admin console later.
//
// The backend can take ~50s to wake on Render's free plan. A visitor
// standing in front of a banner won't wait that long, so after a few
// seconds they're sent to the homepage instead, still tagged with the
// campaign, so a registration is credited to it.
const RESOLVE_TIMEOUT_MS = 6000;
const CODE_PATTERN = /^[23456789abcdefghjkmnpqrstuvwxyz]{8}$/;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toLowerCase();
  const home = new URL("/", request.url);
  if (!CODE_PATTERN.test(code)) {
    return NextResponse.redirect(home, 302);
  }

  // One scan per phone per code per day: a repeat isn't counted again.
  const seenCookie = `bems_qr_${code}`;
  const repeat = request.cookies.has(seenCookie);
  const remember = (response: NextResponse) => {
    response.cookies.set(seenCookie, "1", { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: "lax", secure: true, path: "/q" });
    return response;
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/qr/${code}${repeat ? "?repeat=1" : ""}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS)
      });
      if (res.status === 404) {
        return NextResponse.redirect(home, 302);
      }
      if (res.ok) {
        const { target } = (await res.json()) as { target?: string };
        if (typeof target === "string" && target) {
          // Paths stay on this site; anything else must be an https URL the
          // backend already validated when an admin saved it.
          const destination = target.startsWith("/") ? new URL(target, request.url) : new URL(target);
          if (destination.protocol === "https:" || destination.origin === home.origin) {
            return remember(NextResponse.redirect(destination, 302));
          }
        }
      }
    } catch {
      // timed out or unreachable: fall through to the homepage
    }
  }

  // Not qr=1: this scan wasn't counted, so the homepage counts it.
  home.searchParams.set("utm_source", `c-${code}`);
  return NextResponse.redirect(home, 302);
}
