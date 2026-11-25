import { Router } from "express";
import type { TutorApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isAdmin } from "@/lib/api-auth";
import { checkUsageQuota, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";
import { createNotification } from "@/lib/notifications";
import { sendEmail, adminEmailAddresses } from "@/lib/email";
import { safeLink } from "@/lib/portfolio";

// "Become a Tutor" applications (/become-instructor). Public POST, with an
// hourly limit per IP and a hidden "website" field that only bots fill in;
// admins list and update them. Applicants get a confirmation email so they
// know it arrived; admins get an in-app notification and an email.
const router = Router();

export const TEACHING_MODES = ["IN_PERSON", "ONLINE", "EITHER"] as const;
const STATUSES: TutorApplicationStatus[] = ["NEW", "CONTACTED", "INTERVIEW", "HIRED", "DECLINED"];
const LIMITS = { name: 120, email: 200, phone: 30, experience: 3000, minExperience: 30, url: 500, notes: 3000 };
const MODE_LABELS: Record<string, string> = { IN_PERSON: "In person (Umuahia)", ONLINE: "Online", EITHER: "In person or online" };

const text = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");

router.post("/", async (req, res) => {
  const body = req.body ?? {};
  // Bots fill every field; people never see this one. Pretend it worked.
  if (text(body.website)) return res.status(201).json({ ok: true });

  const quotaKey = `tutor-application:${req.ip || "unknown"}`;
  const quota = await checkUsageQuota(quotaKey, 5, 60 * 60 * 1000);
  if (quota.blocked) return res.status(429).json({ error: rateLimitMessage(quota.retryAfterSeconds!) });

  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const phone = text(body.phone);
  const track = text(body.track);
  const teachingMode = text(body.teachingMode);
  const experience = typeof body.experience === "string" ? body.experience.replace(/\r\n/g, "\n").trim() : "";
  const portfolioRaw = text(body.portfolioUrl);

  if (!name || name.length > LIMITS.name) return res.status(400).json({ error: "Please enter your full name." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > LIMITS.email) return res.status(400).json({ error: "Please enter a valid email address." });
  if (phone.replace(/[^0-9]/g, "").length < 7 || phone.length > LIMITS.phone) return res.status(400).json({ error: "Please enter a phone number we can reach you on." });
  if (!(TEACHING_MODES as readonly string[]).includes(teachingMode)) return res.status(400).json({ error: "Choose how you'd like to teach." });
  if (experience.length < LIMITS.minExperience) return res.status(400).json({ error: "Tell us a little more about your experience (a few sentences)." });
  if (experience.length > LIMITS.experience) return res.status(400).json({ error: `Please keep your experience under ${LIMITS.experience.toLocaleString("en-NG")} characters.` });
  const portfolioUrl = portfolioRaw ? safeLink(portfolioRaw) : null;
  if (portfolioRaw && (!portfolioUrl || portfolioUrl.length > LIMITS.url)) return res.status(400).json({ error: "Portfolio or LinkedIn link must start with https://." });

  const course = track && track !== "other" ? await prisma.course.findUnique({ where: { id: track }, select: { id: true, title: true } }) : null;
  if (track !== "other" && !course) return res.status(400).json({ error: "Choose the course you'd like to teach." });

  await recordAttempt(quotaKey, true);
  const application = await prisma.tutorApplication.create({
    data: { name, email, phone, track: course?.id ?? "other", teachingMode, experience, portfolioUrl }
  });

  const courseTitle = course?.title ?? "another subject";
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", deactivatedAt: null }, select: { id: true } });
  await Promise.all(
    admins.map((a) =>
      createNotification({ userId: a.id, title: "New tutor application", message: `${name} applied to teach ${courseTitle}.`, category: "CLASS", linkUrl: "/admin?tab=settings" })
    )
  );
  await sendEmail({
    to: await adminEmailAddresses(),
    subject: `New tutor application: ${name} (${courseTitle})`,
    text: `${name} applied to teach ${courseTitle}.\n\nEmail: ${email}\nPhone: ${phone}\nTeaching: ${MODE_LABELS[teachingMode]}\n${portfolioUrl ? `Portfolio: ${portfolioUrl}\n` : ""}\nExperience:\n${experience}\n\nReview it in the admin console.`
  });
  await sendEmail({
    to: email,
    subject: "We received your application to teach at BEMS",
    text: `Hi ${name.split(" ")[0]},\n\nThank you for applying to teach ${courseTitle} at BEMS Institute of Technology. Our team reviews every application and will contact you by email or phone if your experience matches what we need.\n\nBEMS Institute of Technology & Vocational Studies, Umuahia`
  });

  return res.status(201).json({ ok: true, id: application.id });
});

// ---- Admin ----
router.get("/", async (req, res) => {
  if (!isAdmin(await getSessionUser(req))) return res.status(403).json({ error: "Admin access required." });
  const status = typeof req.query.status === "string" && STATUSES.includes(req.query.status as TutorApplicationStatus) ? (req.query.status as TutorApplicationStatus) : undefined;
  const [applications, courses, counts] = await Promise.all([
    prisma.tutorApplication.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.course.findMany({ select: { id: true, title: true } }),
    prisma.tutorApplication.groupBy({ by: ["status"], _count: true })
  ]);
  const titles = new Map(courses.map((c) => [c.id, c.title]));
  return res.json({
    applications: applications.map((a) => ({ ...a, trackTitle: titles.get(a.track) ?? "Other", teachingModeLabel: MODE_LABELS[a.teachingMode] ?? a.teachingMode })),
    counts: Object.fromEntries(STATUSES.map((s) => [s, counts.find((c) => c.status === s)?._count ?? 0]))
  });
});

router.patch("/:id", async (req, res) => {
  if (!isAdmin(await getSessionUser(req))) return res.status(403).json({ error: "Admin access required." });
  const data: { status?: TutorApplicationStatus; staffNotes?: string | null } = {};
  if (req.body?.status !== undefined) {
    if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(", ")}.` });
    data.status = req.body.status;
  }
  if (req.body?.staffNotes !== undefined) {
    if (req.body.staffNotes !== null && typeof req.body.staffNotes !== "string") return res.status(400).json({ error: "Notes must be text." });
    const notes = (req.body.staffNotes ?? "").trim();
    if (notes.length > LIMITS.notes) return res.status(400).json({ error: "Notes are too long." });
    data.staffNotes = notes || null;
  }
  const r = await prisma.tutorApplication.updateMany({ where: { id: req.params.id }, data });
  if (r.count === 0) return res.status(404).json({ error: "Application not found." });
  return res.json({ application: await prisma.tutorApplication.findUnique({ where: { id: req.params.id } }) });
});

export default router;
