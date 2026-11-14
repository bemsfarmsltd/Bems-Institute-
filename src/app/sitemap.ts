import type { MetadataRoute } from "next";
import { LMS_COURSES } from "@/data/lms-data";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bems-institute.vercel.app").replace(/\/$/, "");

// Public marketing pages only. Course pages come from the bundled course
// data, so building the sitemap never waits on the (possibly sleeping)
// Render backend.
const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/courses", priority: 0.9 },
  { path: "/subscriptions", priority: 0.8 },
  { path: "/graduates", priority: 0.7 },
  { path: "/become-instructor", priority: 0.5 },
  { path: "/live", priority: 0.5 },
  { path: "/community", priority: 0.4 },
  { path: "/leaderboard", priority: 0.3 },
  { path: "/login", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...PUBLIC_PAGES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      priority
    })),
    ...LMS_COURSES.map((course) => ({
      url: `${SITE_URL}/courses/${course.slug}`,
      lastModified: now,
      priority: 0.9
    }))
  ];
}
