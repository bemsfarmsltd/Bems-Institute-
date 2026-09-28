This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Accounts & database

User accounts (name/email/password) are real, stored in Postgres via Prisma
— not mocked. Local dev uses a portable, no-install PostgreSQL at
`C:\Users\hp\AppData\Local\bems-postgres` (not a Windows service).

```bash
npm run postgres:start   # start local Postgres (needed before `npm run dev`)
npm run dev
npm run db:seed          # (re-)create the two demo accounts below
npm run postgres:stop    # stop it when done
```

Demo accounts (seeded by `npm run db:seed`, password `demo1234` for both):
- `chinedu.okeke@mouau.edu.ng` — STUDENT
- `victor.lead@bemsinstitute.ng` — INSTRUCTOR

New STUDENT/INSTRUCTOR accounts can sign up at `/login`. ADMIN accounts can't
self-register — the first admin registers at `/admin` with the
`ADMIN_ACCESS_CODE` from `.env.local` (a one-time invite code, not a standing
password); after that they sign in normally with their own email/password.

**Before deploying anywhere** (Vercel, etc.): this local Postgres only
exists on this machine. Point `DATABASE_URL` in `.env.local` at a real hosted
Postgres (Vercel Postgres, Neon, Supabase, Railway, ...) and re-run
`npx prisma migrate deploy` against it.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
