// Runs inside every test worker before any test file's imports resolve —
// unlike the config file (which only runs once in the main process),
// setupFiles entries are guaranteed to execute in the same context test
// files run in, so this is the safe place to load env vars that
// @/lib/prisma.ts needs at import time.
try {
  process.loadEnvFile(".env.local");
} catch {
  // CI provides env vars directly — no .env.local file is expected there
}
