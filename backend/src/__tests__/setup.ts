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

// Bank transfer is only offered once an account is set in Admin Settings
// (see lib/site-settings.ts); most payment tests pay by transfer.
export const TEST_BANK = { bankName: "Test Bank", bankAccountName: "BEMS Test Account", bankAccountNumber: "0000000000" };
const { prisma } = await import("@/lib/prisma");
await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: TEST_BANK, create: { id: "singleton", ...TEST_BANK } });
