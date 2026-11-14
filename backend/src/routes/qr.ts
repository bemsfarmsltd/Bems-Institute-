import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { CODE_PATTERN, campaignSource, isExternalTarget, landingUrl } from "@/lib/qr-campaigns";

const router = Router();

// Public: resolves a campaign QR's short link (/q/<code> on the site, see
// src/app/q/[code]/route.ts) and counts the scan. Counted here rather than
// on the landing page because an outside website can't count it, and a
// landing page without AttributionCapture wouldn't either.
//
// Not rate-limited per IP: every request arrives from the site's own server,
// so an IP limit would block real scans. The worst abuse is an inflated scan
// count; nothing is unlocked or sent.
router.get("/:code", async (req, res) => {
  const code = req.params.code.toLowerCase();
  if (!CODE_PATTERN.test(code)) {
    return res.status(404).json({ error: "Unknown QR code." });
  }

  const campaign = await prisma.qrCampaign.findUnique({ where: { code } });
  if (!campaign || !campaign.active) {
    return res.status(404).json({ error: "This QR code is no longer active." });
  }

  const courseId = isExternalTarget(campaign.targetUrl)
    ? null
    : new URL(campaign.targetUrl, "https://placeholder.invalid").searchParams.get("course");
  await prisma.qrScan.create({ data: { source: campaignSource(code), courseId } });

  return res.json({ target: landingUrl(campaign.targetUrl, code), external: isExternalTarget(campaign.targetUrl) });
});

export default router;
