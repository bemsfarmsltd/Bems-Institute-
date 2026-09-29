# BEMS Backend

Standalone Express API — everything that used to live under `bems-next-app/src/app/api/**` now lives here, decoupled from the Next.js frontend. Same Prisma schema, same Neon database, same session-cookie auth model; only the transport changed (relative same-origin fetches → absolute cross-origin fetches with `credentials: "include"`).

## Local development

```bash
cd backend
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Runs on `http://localhost:4000` by default (`PORT` in `.env.local`). The frontend needs `NEXT_PUBLIC_API_URL=http://localhost:4000` in its own `.env.local` to find it.

**Note on this machine specifically:** this network blocks outbound port 5432 to Neon directly, so local dev here uses the portable local Postgres instead (see the commented `DATABASE_URL` in `.env.local`) — production still uses Neon, since Render's network doesn't have that restriction.

## Deploying to Render

1. Push this repo to GitHub (already done — `bemsfarmsltd/Bems-Institute-`).
2. On Render: **New → Blueprint**, connect the repo. Render will detect `backend/render.yaml` automatically and propose a `bems-backend` web service with `Root Directory: backend`.
3. Fill in the env vars it prompts for (all marked `sync: false` in `render.yaml`, so Render won't auto-fill them):
   - `DATABASE_URL` — the same Neon connection string the frontend uses.
   - `SESSION_SECRET` — any long random value (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - `ADMIN_ACCESS_CODE` — the staff invite code.
   - `GEMINI_API_KEY` — optional, falls back to a local rule-based tutor engine if omitted.
   - `FRONTEND_URL` — the deployed Vercel URL (e.g. `https://bems-institute.vercel.app`). Used for CORS and for building password-reset links.
4. Deploy. Render gives you a URL like `https://bems-backend.onrender.com`.
5. On Vercel (the frontend project): add `NEXT_PUBLIC_API_URL=https://bems-backend.onrender.com` as an environment variable, then redeploy.

At that point the frontend's browser-side code talks directly to Render; nothing routes through Vercel's serverless functions anymore for these endpoints.

## What changed vs. the Next.js version

- **Cross-origin cookies**: `SESSION_COOKIE_OPTIONS` now sets `SameSite=None; Secure` in production (required for a cookie to survive a cross-site fetch) and falls back to `Lax`/insecure only for local dev over plain http.
- **`src/proxy.ts` was removed from the frontend.** It used to block `/instructor/*` server-side by reading the session cookie directly — but that cookie is now scoped to the backend's origin, which Next.js's own server can never see. Route protection is now entirely client-side (`RequireRole`), same defense the app already had as a second layer; the underlying data endpoints remain properly authenticated regardless, so nothing became less secure — a logged-out visitor just sees a page shell flash before the client-side redirect instead of getting bounced server-side.
- **Free-tier cold starts**: Render's free plan spins the service down after 15 minutes of inactivity. The first request after idle can take 30-50s to wake it back up. Fine for a demo; worth upgrading off the free tier before this is a real production path for actual admissions traffic.
