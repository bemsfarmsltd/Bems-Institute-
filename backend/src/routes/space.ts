import { Router, type Request, type Response } from "express";
import { getSessionUser, isStaff } from "@/lib/api-auth";
import { getPortfolioSettings, savePortfolioSettings, PortfolioError } from "@/lib/portfolio";
import { listNotes, getNote, saveNote, listBookmarks, addBookmark, removeBookmark, StudyError } from "@/lib/study-notes";
import { getReminderSettings, saveReminderSettings, ReminderPrefsError } from "@/lib/reminders";
import { saveSubscription, removeSubscription, PushError } from "@/lib/push";

// The student's own tools in My Space (Phase 4), mounted at /api/lms:
// public-portfolio settings, lesson notes, bookmarks, reminder settings and
// push sign-up. Everything is scoped to the signed-in user.
const router = Router();

async function signedIn(req: Request, res: Response) {
  const session = await getSessionUser(req);
  if (!session) res.status(401).json({ error: "Not authenticated." });
  return session;
}

function fail(res: Response, err: unknown) {
  if (err instanceof PortfolioError || err instanceof StudyError) return res.status(err.status).json({ error: err.message });
  if (err instanceof ReminderPrefsError || err instanceof PushError) return res.status(400).json({ error: err.message });
  throw err;
}

// ---- Public portfolio settings ----
router.get("/my-space/portfolio", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  return res.json(await getPortfolioSettings(session.id));
});

router.patch("/my-space/portfolio", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  if (session.role !== "STUDENT") return res.status(403).json({ error: "Public pages are for students." });
  try {
    return res.json(await savePortfolioSettings(session.id, req.body ?? {}));
  } catch (err) {
    return fail(res, err);
  }
});

// ---- Lesson notes ----
router.get("/notes", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  return res.json({ notes: await listNotes(session.id, isStaff(session)) });
});

router.get("/notes/:lessonId", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    return res.json({ note: await getNote(session.id, req.params.lessonId, isStaff(session)) });
  } catch (err) {
    return fail(res, err);
  }
});

router.put("/notes/:lessonId", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    return res.json({ note: await saveNote(session.id, req.params.lessonId, req.body?.body, isStaff(session)) });
  } catch (err) {
    return fail(res, err);
  }
});

// ---- Bookmarks ----
router.get("/bookmarks", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  return res.json({ bookmarks: await listBookmarks(session.id, isStaff(session)) });
});

router.post("/bookmarks", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    return res.status(201).json({ bookmark: await addBookmark(session.id, req.body ?? {}, isStaff(session)) });
  } catch (err) {
    return fail(res, err);
  }
});

router.delete("/bookmarks/:id", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    await removeBookmark(session.id, req.params.id);
    return res.json({ ok: true });
  } catch (err) {
    return fail(res, err);
  }
});

// ---- Reminders ----
router.get("/reminders", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  return res.json(await getReminderSettings(session.id));
});

router.patch("/reminders", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    return res.json(await saveReminderSettings(session.id, req.body ?? {}));
  } catch (err) {
    return fail(res, err);
  }
});

router.post("/push/subscribe", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  try {
    await saveSubscription(session.id, req.body ?? {});
    return res.json({ ok: true });
  } catch (err) {
    return fail(res, err);
  }
});

router.post("/push/unsubscribe", async (req, res) => {
  const session = await signedIn(req, res);
  if (!session) return;
  await removeSubscription(session.id, req.body?.endpoint);
  return res.json({ ok: true });
});

export default router;
