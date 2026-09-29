import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "@/routes/auth";
import adminAuthRoutes from "@/routes/admin-auth";
import adminRoutes from "@/routes/admin";
import aiRoutes from "@/routes/ai";
import instructorRoutes from "@/routes/instructor";
import learningRoutes from "@/routes/learning";
import lmsRoutes from "@/routes/lms";

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

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`BEMS backend listening on port ${PORT}`);
  console.log(`Allowed frontend origin(s): ${allowedOrigins.join(", ")}`);
});
