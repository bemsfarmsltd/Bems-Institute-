import { defineConfig, env } from "prisma/config";

// Same pattern as the frontend's prisma.config.ts: load .env.local for local
// dev CLI commands, and no-op on hosts (Render, CI) that inject env vars
// directly instead of shipping a physical .env.local file.
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
