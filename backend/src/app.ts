import express from "express";
// Must be imported immediately after express and before any Router() is
// created (including in the route files below) — it patches Express so a
// rejected/thrown promise inside an async handler is forwarded to the error
// middleware instead of becoming an unhandled rejection that can crash the
// whole process. Several staff routes (unknown course/user id -> Prisma
// P2025/P2003) relied on this being true before it actually was.
import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "@/routes/auth";
import adminAuthRoutes from "@/routes/admin-auth";
import adminRoutes from "@/routes/admin";
import aiRoutes from "@/routes/ai";
import instructorRoutes from "@/routes/instructor";
import learningRoutes from "@/routes/learning";
import lmsRoutes from "@/routes/lms";
import referralsRoutes from "@/routes/referrals";
import graduatesRoutes from "@/routes/graduates";
import attendanceRoutes from "@/routes/attendance";
import communityRoutes from "@/routes/community";
import paymentsRoutes from "@/routes/payments";

// The configured Express app, with no .listen() call — split out from
// index.ts so tests can import this directly (via supertest) without
// binding a real port. index.ts is the only thing that actually starts
// the server.
export const app = express();

// Render sits in front of this app as a reverse proxy — without this,
// req.ip is always the proxy's address for every request, which would
// silently turn every per-IP rate limit (signup, admin-register-code) back
// into one shared limit for all traffic. `1` trusts exactly one hop
// (Render's own proxy), not an arbitrary chain from the client.
app.set("trust proxy", 1);

// Don't advertise the framework, and send baseline security headers on every
// response. This is a JSON-only API — nothing here is ever meant to be
// rendered or framed by a browser, so the CSP can deny everything.
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  next();
});

// Frontend (Vercel) and backend (Render) are on different origins, so CORS
// has to name the frontend explicitly — a wildcard origin doesn't work
// together with credentials: true, and cookies are the whole auth model
// here, so credentials must stay on.
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(cookieParser());
// The `verify` callback stashes the exact raw bytes of every request body
// on req.rawBody *before* express.json() parses them — POST /payments/webhook
// needs those exact bytes (not a re-serialized JSON.stringify) to check
// Paystack's HMAC signature, since any reformatting changes the hash.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    }
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/lms", lmsRoutes);
app.use("/api/referrals", referralsRoutes);
app.use("/api/graduates", graduatesRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/payments", paymentsRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next;
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});
