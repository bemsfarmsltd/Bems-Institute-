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

const app = express();
const PORT = process.env.PORT || 4000;

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
app.use(express.json());

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

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

// Defense-in-depth for anything that rejects outside an Express request
// context (a stray setTimeout/background call express-async-errors above
// can't see) — log it instead of letting Node crash the whole process.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

app.listen(PORT, () => {
  console.log(`BEMS backend listening on port ${PORT}`);
  console.log(`Allowed frontend origin(s): ${allowedOrigins.join(", ")}`);
});
