import { defineConfig, env } from "prisma/config";

// The Prisma CLI doesn't read Next.js's .env.local automatically, so load it
// explicitly (this is only for `prisma` CLI commands — the Next app itself
// already picks up .env.local on its own).
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL")
  }
});
