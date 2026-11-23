// Lesson notes and bookmarks, kept in the student's own space. Private:
// every query is scoped to the caller's userId, and nothing here is shown to
// tutors, classmates or the public portfolio.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/api-auth";
import { safeLink } from "@/lib/portfolio";

export class StudyError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export const NOTE_MAX = 5000;
export const MAX_NOTES = 500;
export const MAX_BOOKMARKS = 200;
export const BOOKMARK_TITLE_MAX = 120;
export const BOOKMARK_URL_MAX = 500;

const lessonSelect = {
  id: true,
  title: true,
  isFreePreview: true,
  module: { select: { title: true, courseId: true, course: { select: { slug: true, title: true } } } }
} as const;

type LessonRow = Prisma.LessonGetPayload<{ select: typeof lessonSelect }>;

async function accessibleCourseIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.enrollment.findMany({ where: { userId }, select: { courseId: true, status: true, paymentStatus: true } });
  return new Set(rows.filter(hasCourseAccess).map((r) => r.courseId));
}

function canOpen(lesson: LessonRow, courseIds: Set<string>, staff: boolean): boolean {
  return staff || lesson.isFreePreview || courseIds.has(lesson.module.courseId);
}

function lessonInfo(lesson: LessonRow, open: boolean) {
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    moduleTitle: lesson.module.title,
    courseTitle: lesson.module.course.title,
    courseSlug: lesson.module.course.slug,
    // Only a lesson the student can still open gets a link.
    href: open ? `/learn/${lesson.module.course.slug}/${lesson.id}` : null
  };
}

/** The lesson, if it exists and this user may open it; otherwise a 404 (not revealing paid lessons exist). */
async function openableLesson(userId: string, lessonId: string, staff: boolean): Promise<LessonRow> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: lessonSelect });
  if (!lesson || !canOpen(lesson, await accessibleCourseIds(userId), staff)) throw new StudyError("Lesson not found.", 404);
  return lesson;
}

// ---- Notes -----------------------------------------------------------------

export async function listNotes(userId: string, staff: boolean) {
  const [notes, courseIds] = await Promise.all([
    prisma.lessonNote.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, select: { body: true, updatedAt: true, lesson: { select: lessonSelect } } }),
    accessibleCourseIds(userId)
  ]);
  // The student keeps their own words even if they lose access to the lesson.
  return notes.map((n) => ({ ...lessonInfo(n.lesson, canOpen(n.lesson, courseIds, staff)), body: n.body, updatedAt: n.updatedAt }));
}

export async function getNote(userId: string, lessonId: string, staff: boolean) {
  await openableLesson(userId, lessonId, staff);
  const note = await prisma.lessonNote.findUnique({ where: { userId_lessonId: { userId, lessonId } }, select: { body: true, updatedAt: true } });
  return note;
}

/** Saves the note; an empty note deletes it. Returns the saved note or null. */
export async function saveNote(userId: string, lessonId: string, rawBody: unknown, staff: boolean) {
  if (typeof rawBody !== "string") throw new StudyError("Write your note as text.");
  const body = rawBody.replace(/\r\n/g, "\n").trim();
  if (body.length > NOTE_MAX) throw new StudyError(`Notes can be up to ${NOTE_MAX.toLocaleString("en-NG")} characters.`);
  await openableLesson(userId, lessonId, staff);

  if (!body) {
    await prisma.lessonNote.deleteMany({ where: { userId, lessonId } });
    return null;
  }
  const exists = await prisma.lessonNote.findUnique({ where: { userId_lessonId: { userId, lessonId } }, select: { id: true } });
  if (!exists && (await prisma.lessonNote.count({ where: { userId } })) >= MAX_NOTES) {
    throw new StudyError(`You can keep up to ${MAX_NOTES} lesson notes. Delete an old one to add more.`);
  }
  return prisma.lessonNote.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { body },
    create: { userId, lessonId, body },
    select: { body: true, updatedAt: true }
  });
}

// ---- Bookmarks -------------------------------------------------------------

const bookmarkSelect = { id: true, title: true, url: true, createdAt: true, lesson: { select: lessonSelect } } as const;
type BookmarkRow = Prisma.BookmarkGetPayload<{ select: typeof bookmarkSelect }>;

function mapBookmark(b: BookmarkRow, courseIds: Set<string>, staff: boolean) {
  if (b.lesson) {
    const info = lessonInfo(b.lesson, canOpen(b.lesson, courseIds, staff));
    return { id: b.id, kind: "LESSON" as const, title: b.title, url: null, ...info, createdAt: b.createdAt };
  }
  return {
    id: b.id, kind: "LINK" as const, title: b.title, url: b.url,
    lessonId: null, lessonTitle: null, moduleTitle: null, courseTitle: null, courseSlug: null, href: null,
    createdAt: b.createdAt
  };
}

export async function listBookmarks(userId: string, staff: boolean) {
  const [rows, courseIds] = await Promise.all([
    prisma.bookmark.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: bookmarkSelect }),
    accessibleCourseIds(userId)
  ]);
  return rows.map((b) => mapBookmark(b, courseIds, staff));
}

export interface BookmarkInput {
  lessonId?: unknown;
  url?: unknown;
  title?: unknown;
}

/** Saves a lesson ({ lessonId }) or a link ({ url, title }). Saving the same thing twice returns the existing bookmark. */
export async function addBookmark(userId: string, input: BookmarkInput, staff: boolean) {
  let data: { lessonId?: string; url?: string; title: string };
  if (typeof input.lessonId === "string" && input.lessonId) {
    const lesson = await openableLesson(userId, input.lessonId, staff);
    data = { lessonId: lesson.id, title: lesson.title };
  } else if (typeof input.url === "string") {
    const url = safeLink(input.url);
    if (!url || url.length > BOOKMARK_URL_MAX) throw new StudyError("Enter a full web address starting with https://.");
    const title = typeof input.title === "string" ? input.title.replace(/\s+/g, " ").trim() : "";
    if (!title) throw new StudyError("Give the link a short name.");
    if (title.length > BOOKMARK_TITLE_MAX) throw new StudyError(`Keep the name under ${BOOKMARK_TITLE_MAX} characters.`);
    data = { url, title };
  } else {
    throw new StudyError("Choose a lesson or enter a link to save.");
  }

  const where = data.lessonId ? { userId, lessonId: data.lessonId } : { userId, url: data.url };
  let row = await prisma.bookmark.findFirst({ where, select: bookmarkSelect });
  if (!row) {
    if ((await prisma.bookmark.count({ where: { userId } })) >= MAX_BOOKMARKS) {
      throw new StudyError(`You can save up to ${MAX_BOOKMARKS} bookmarks. Remove an old one to add more.`);
    }
    try {
      row = await prisma.bookmark.create({ data: { userId, ...data }, select: bookmarkSelect });
    } catch (err) {
      // Saved twice at the same moment: use the one that won.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
      row = await prisma.bookmark.findFirstOrThrow({ where, select: bookmarkSelect });
    }
  }
  return mapBookmark(row, await accessibleCourseIds(userId), staff);
}

export async function removeBookmark(userId: string, id: string): Promise<void> {
  const r = await prisma.bookmark.deleteMany({ where: { id, userId } });
  if (r.count === 0) throw new StudyError("Bookmark not found.", 404);
}
