// The actual npm entry point. This has to run BEFORE anything else is
// imported — a static `import` of index.ts up top would get hoisted and
// evaluate @/lib/prisma.ts (which reads process.env.DATABASE_URL at module
// load time) before .env.local had a chance to load. A dynamic import()
// genuinely defers evaluation until this line actually runs, so env vars
// are guaranteed to be in place first. On Render/production there's no
// .env.local file at all — env vars are injected directly — so a missing
// file here is expected and safe to ignore.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local on disk — fall through to process.env as provided by the host
}

import("./index");
