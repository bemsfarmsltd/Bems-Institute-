// The two demo accounts from prisma/seed.ts. Their password ("demo1234") is
// public (README, login page), so on the live site they'd let anyone sign in
// as an INSTRUCTOR and grade capstones or mark attendance for real students.
// They're refused in production unless ALLOW_DEMO_ACCOUNTS=true, both at
// sign-in and for any session already open.
export const DEMO_ACCOUNT_EMAILS = new Set([
  "chinedu.okeke@mouau.edu.ng",
  "victor.lead@bemsinstitute.ng"
]);

export function demoAccountsAllowed(): boolean {
  const flag = process.env.ALLOW_DEMO_ACCOUNTS;
  if (flag !== undefined && flag !== "") return flag === "true";
  return process.env.NODE_ENV !== "production";
}

export function isBlockedDemoAccount(email: string | null | undefined): boolean {
  return !!email && DEMO_ACCOUNT_EMAILS.has(email.trim().toLowerCase()) && !demoAccountsAllowed();
}
