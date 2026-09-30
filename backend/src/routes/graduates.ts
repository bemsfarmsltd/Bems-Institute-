import { Router } from "express";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin, isStaff } from "@/lib/api-auth";

const router = Router();

const LIMITS = { headline: 150, company: 100, quote: 500, photoUrl: 500 };

function fieldLengthError(headline?: string, company?: string | null, quote?: string | null, photoUrl?: string | null): string | null {
  if (headline && headline.length > LIMITS.headline) return `headline must be ${LIMITS.headline} characters or fewer.`;
  if (company && company.length > LIMITS.company) return `company must be ${LIMITS.company} characters or fewer.`;
  if (quote && quote.length > LIMITS.quote) return `quote must be ${LIMITS.quote} characters or fewer.`;
  if (photoUrl && photoUrl.length > LIMITS.photoUrl) return `photoUrl must be ${LIMITS.photoUrl} characters or fewer.`;
  return null;
}

// Public: the "where they are now" page (PRD §5.3) — only ever shows
// entries an admin explicitly published, never auto-generated from a
// certificate, since a name/photo on public marketing content needs the
// graduate's consent, not just a passing grade.
router.get("/", async (_req, res) => {
  const outcomes = await prisma.graduateOutcome.findMany({
    where: { published: true },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  return res.json({
    outcomes: outcomes.map((o) => ({
      id: o.id,
      name: o.user.name,
      courseTitle: o.course.title,
      headline: o.headline,
      company: o.company,
      quote: o.quote,
      photoUrl: o.photoUrl,
      featured: o.featured
    }))
  });
});

// Staff: full list including unpublished drafts, for curation.
router.get("/admin", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const outcomes = await prisma.graduateOutcome.findMany({
    include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" }
  });

  return res.json({ outcomes });
});

// Staff: certified users eligible to be featured (so the admin picker
// doesn't require typing a raw userId).
router.get("/eligible", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isStaff(session)) {
    return res.status(403).json({ error: "Staff access required." });
  }

  const certificates = await prisma.certificate.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, course: { select: { id: true, title: true } } },
    orderBy: { issuedAt: "desc" }
  });

  return res.json({
    eligible: certificates.map((c) => ({
      userId: c.userId,
      userName: c.user.name,
      userEmail: c.user.email,
      courseId: c.courseId,
      courseTitle: c.course.title,
      gradeTitle: c.gradeTitle
    }))
  });
});

router.post("/", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const body = req.body ?? {};
  const userId = typeof body.userId === "string" ? body.userId : "";
  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  const headline = typeof body.headline === "string" ? body.headline.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : null;
  const quote = typeof body.quote === "string" ? body.quote.trim() : null;
  const photoUrl = typeof body.photoUrl === "string" ? body.photoUrl.trim() : null;

  if (!userId || !courseId || !headline) {
    return res.status(400).json({ error: "userId, courseId, and headline are required." });
  }
  const lengthError = fieldLengthError(headline, company, quote, photoUrl);
  if (lengthError) {
    return res.status(400).json({ error: lengthError });
  }

  const outcome = await prisma.graduateOutcome.create({
    data: { userId, courseId, headline, company, quote, photoUrl }
  });

  return res.json({ outcome });
});

router.patch("/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const body = req.body ?? {};
  const data: Record<string, unknown> = {};
  if (typeof body.published === "boolean") data.published = body.published;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.headline === "string") data.headline = body.headline.trim();
  if (typeof body.company === "string") data.company = body.company.trim() || null;
  if (typeof body.quote === "string") data.quote = body.quote.trim() || null;
  if (typeof body.photoUrl === "string") data.photoUrl = body.photoUrl.trim() || null;

  const lengthError = fieldLengthError(
    data.headline as string | undefined,
    data.company as string | null | undefined,
    data.quote as string | null | undefined,
    data.photoUrl as string | null | undefined
  );
  if (lengthError) {
    return res.status(400).json({ error: lengthError });
  }

  const outcome = await prisma.graduateOutcome.update({ where: { id }, data });
  return res.json({ outcome });
});

router.delete("/:id", async (req, res) => {
  const session = await getSessionUser(req);
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Admin access required." });
  }

  await prisma.graduateOutcome.delete({ where: { id: req.params.id } });
  return res.json({ ok: true });
});

export default router;
