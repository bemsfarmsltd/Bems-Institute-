import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Load .env.local in local development; on Vercel/CI, env vars are injected directly.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/bems_lms"
  }
});
