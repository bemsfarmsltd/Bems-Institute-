import type { MetadataRoute } from "next";
import { SITE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in areas and one-off token pages — nothing useful to index.
      disallow: [
        "/admin",
        "/instructor",
        "/dashboard",
        "/learn",
        "/reset-password",
        "/forgot-password",
        "/qr-studio",
        "/error-404"
      ]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
