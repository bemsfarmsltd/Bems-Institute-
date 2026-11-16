import { Router } from "express";
import { timingSafeEqual, createHash } from "crypto";
import { sendWeeklyRecaps } from "@/lib/weekly-recap";

// Scheduled jobs, called by GitHub Actions (.github/workflows/weekly-recap.yml)
// with "Authorization: Bearer <CRON_SECRET>". Render's free plan sleeps, so
// the server can't run its own timer; the call also wakes it up.
const router = Router();

function authorized(header: string | undefined): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || !header?.startsWith("Bearer ")) return false;
  // Compare fixed-length hashes so the check takes the same time whatever was sent.
  const a = createHash("sha256").update(header.slice(7)).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

router.post("/weekly-recap", async (req, res) => {
  if (!process.env.CRON_SECRET) return res.status(503).json({ error: "Scheduled jobs are not configured." });
  if (!authorized(req.headers.authorization)) return res.status(401).json({ error: "Not authorized." });
  const result = await sendWeeklyRecaps();
  return res.json(result);
});

export default router;
