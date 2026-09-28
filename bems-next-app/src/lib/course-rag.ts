import { LMS_COURSES } from "@/data/lms-data";

// ---------------------------------------------------------------------------
// Lightweight "RAG" over the static course catalog: no embeddings/vector DB,
// just keyword-overlap scoring against real lesson content. This is what
// grounds the AI tutor in actual BEMS course material (see the `tutor`
// action in src/app/api/ai/route.ts) instead of generic knowledge — and it
// degrades gracefully with zero external dependencies, which matters since
// GEMINI_API_KEY isn't set in this environment and the tutor mostly runs on
// the local fallback engine.
// ---------------------------------------------------------------------------

export interface CourseKnowledgeSnippet {
  id: string;
  title: string;
  content: string;
  sourceType: "lesson" | "course";
  lessonUrl?: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "is", "are", "was", "were", "be", "been",
  "to", "of", "in", "on", "for", "with", "how", "what", "why", "does",
  "do", "i", "you", "we", "it", "this", "that", "can", "could", "would",
  "should", "my", "me", "your", "explain", "please", "help"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function scoreText(text: string, keywords: string[], weight: number): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += weight;
  }
  return score;
}

/**
 * Finds the lessons (and, as a fallback, course-level summaries) most
 * relevant to a free-text query. Synchronous and in-memory — the catalog is
 * small enough (4 courses, ~50 lessons) that a full scan per request is
 * cheap and needs no index.
 */
export function retrieveCourseKnowledge(
  query: string,
  courseTrack?: string,
  limit = 3
): CourseKnowledgeSnippet[] {
  const keywords = tokenize(query);
  if (keywords.length === 0) return [];

  const candidateCourses = courseTrack
    ? LMS_COURSES.filter((c) => c.id === courseTrack || c.slug === courseTrack)
    : LMS_COURSES;
  const courses = candidateCourses.length > 0 ? candidateCourses : LMS_COURSES;

  const scored: (CourseKnowledgeSnippet & { score: number })[] = [];

  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const score =
          scoreText(lesson.title, keywords, 3) + scoreText(lesson.description, keywords, 1);
        if (score > 0) {
          scored.push({
            id: lesson.id,
            title: `${course.title}: ${lesson.title}`,
            content: lesson.description,
            sourceType: "lesson",
            lessonUrl: `/learn/${course.slug}/${lesson.id}`,
            score
          });
        }
      }
    }

    // Course-level fallback so a broad question about a track still grounds
    // to something, even when no single lesson description matches well.
    const courseScore = scoreText(`${course.title} ${course.tagline} ${course.finalProject}`, keywords, 2);
    if (courseScore > 0) {
      scored.push({
        id: course.id,
        title: course.title,
        content: `${course.tagline} Final project: ${course.finalProject}`,
        sourceType: "course",
        score: courseScore
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...snippet }) => snippet);
}
