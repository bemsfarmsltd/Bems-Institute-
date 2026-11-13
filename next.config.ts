import type { NextConfig } from "next";

// Security headers sent with every page.
//
// The Content-Security-Policy is deliberately narrow: it only stops other
// sites from framing BEMS (clickjacking) and blocks plugins/<base> hijacking.
// It does NOT restrict script-src/frame-src yet — the Paystack inline
// checkout (js.paystack.co + its iframe), YouTube/Vimeo lesson embeds and the
// sandbox iframe all need allowances, and a wrong full policy would break
// payments on a live site. Tighten it in Report-Only mode first.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'"
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
