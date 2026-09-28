import { defineConfig, env } from "prisma/config";

// The Prisma CLI doesn't read Next.js's .env.local automatically, so load it
// explicitly for local dev (this is only for `prisma` CLI commands — the
// Next app itself already picks up .env.local on its own). In hosted builds
// (Vercel, CI) there is no .env.local file at all — env vars are injected
// straight into process.env by the platform — so a missing file here is
// expected and safe to ignore, not a real error.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local on disk — fall through to process.env as provided by the host
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL")
  }
});
