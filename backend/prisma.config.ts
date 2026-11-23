import { defineConfig, env } from "prisma/config";

// Same pattern as the frontend's prisma.config.ts: load .env.local for local
// dev CLI commands, and no-op on hosts (Render, CI) that inject env vars
// directly instead of shipping a physical .env.local file.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local on disk — fall through to process.env as provided by the host
}

// This config is only read by the Prisma CLI (migrate deploy on Render's
// build, generate, local commands); the running app connects through the
// adapter in src/lib/prisma.ts with DATABASE_URL. Migrations prefer
// DIRECT_URL, Neon's direct (non "-pooler") address: migrate holds a
// session advisory lock, and through the pooler that lock can outlive the
// deploy and block every later one (P1002, Nov 2026). Falls back to
// DATABASE_URL where no direct address is set (local dev, tests).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || env("DATABASE_URL")
  }
});
