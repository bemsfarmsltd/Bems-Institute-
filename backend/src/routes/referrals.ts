import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/api-auth";
import { ensureReferralCode } from "@/lib/referrals";

const router = Router();

// The current user's own referral code, credit balance, and history of
// who they've referred so far (and whether each one has paid yet).
router.get("/me", async (req, res) => {
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const code = await ensureReferralCode(session.id);
  const [user, referrals] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.id }, select: { creditBalanceNaira: true } }),
    prisma.referral.findMany({
      where: { referrerId: session.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return res.json({
    referralCode: code,
    creditBalanceNaira: user?.creditBalanceNaira ?? 0,
    referrals: referrals.map((r) => ({
      id: r.id,
      refereeName: r.refereeName,
      status: r.status,
      creditNaira: r.creditNaira,
      createdAt: r.createdAt,
      creditedAt: r.creditedAt
    }))
  });
});

export default router;
