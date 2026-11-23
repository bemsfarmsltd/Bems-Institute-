import { Router } from "express";
import { getPublicPortfolio } from "@/lib/portfolio";

// Public: a student's opt-in portfolio page (/u/<handle> on the site). No
// sign-in. Turned off, unknown and deactivated pages all return the same 404.
const router = Router();

router.get("/:handle", async (req, res) => {
  // Not cached, so turning the page off takes effect at once.
  res.set("Cache-Control", "no-store");
  const portfolio = await getPublicPortfolio(req.params.handle);
  if (!portfolio) return res.status(404).json({ error: "This page isn't available." });
  return res.json({ portfolio });
});

export default router;
