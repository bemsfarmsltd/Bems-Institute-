// Who may do what. Each staff role gets a fixed set of permissions; an
// account's permissions are the union of its role and extraRoles. ADMIN
// may do everything.
//
// isStaff()/isAdmin() in api-auth.ts keep their old meaning (tutors and
// admins): teaching features (grading, lesson access, attendance) stay
// with them. The new roles reach only what is listed here, so finance can
// see payments but cannot grade a project or open lesson videos.

import type { UserRole } from "@prisma/client";

export const PERMISSIONS = [
  "analytics.view", //       dashboard charts and totals
  "reports.view", //         management reports and the audit log
  "cohorts.view",
  "courses.manage", //       create courses and cohorts, publish/unpublish
  "roster.view", //          full student list with contact details and money
  "roster.export",
  "payments.view", //        payment ledger and export
  "payments.record", //      confirm a payment (bank transfer, cash)
  "payments.refund", //      refunds and overpayment refunds
  "admissions.manage", //    leads, welcome calls, enrolment status, second chance
  "admissions.approve", //   approve paid registrations
  "campaigns.manage", //     QR campaigns
  "tutors.recruit", //       tutor applications
  "placements.view",
  "placements.manage",
  "graduates.manage",
  "reviews.view",
  "reviews.manage",
  "staff.manage", //         staff accounts, roles, invites, 2-step resets
  "settings.manage" //       site settings, recaps, community links, course tutors
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL = new Set<Permission>(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  STUDENT: new Set(),
  // Tutors work through isStaff() (teaching) and their tutor view; no office permissions.
  INSTRUCTOR: new Set(),
  ADMIN: ALL,
  FINANCE: new Set<Permission>(["analytics.view", "cohorts.view", "roster.view", "roster.export", "payments.view", "payments.record", "payments.refund"]),
  ADMISSIONS: new Set<Permission>([
    "cohorts.view", "roster.view", "roster.export", "payments.record", "admissions.manage", "admissions.approve", "campaigns.manage", "tutors.recruit"
  ]),
  // Read-only: totals, trends and reports, not students' private details.
  MANAGEMENT: new Set<Permission>(["analytics.view", "reports.view", "cohorts.view", "placements.view", "reviews.view"])
};

export const STAFF_ROLE_LIST: UserRole[] = ["ADMIN", "INSTRUCTOR", "FINANCE", "ADMISSIONS", "MANAGEMENT"];
export const OFFICE_ROLES: UserRole[] = ["FINANCE", "ADMISSIONS", "MANAGEMENT"];

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Student",
  INSTRUCTOR: "Tutor",
  ADMIN: "Admin",
  FINANCE: "Finance",
  ADMISSIONS: "Admissions",
  MANAGEMENT: "Management"
};

// Where each role lands after signing in (the first role that has a portal wins).
const PORTAL_ORDER: [UserRole, string][] = [
  ["ADMIN", "/admin"],
  ["MANAGEMENT", "/management"],
  ["FINANCE", "/finance"],
  ["ADMISSIONS", "/admissions"],
  ["INSTRUCTOR", "/tutor"],
  ["STUDENT", "/dashboard"]
];

export interface RoleHolder {
  role: UserRole;
  roles?: UserRole[];
}

export function rolesOf(s: RoleHolder | null | undefined): UserRole[] {
  if (!s) return [];
  return [...new Set([s.role, ...(s.roles ?? [])])];
}

export function permissionsOf(s: RoleHolder | null | undefined): Permission[] {
  const out = new Set<Permission>();
  for (const r of rolesOf(s)) for (const p of ROLE_PERMISSIONS[r] ?? []) out.add(p);
  return PERMISSIONS.filter((p) => out.has(p));
}

export function can(s: RoleHolder | null | undefined, permission: Permission): boolean {
  return rolesOf(s).some((r) => ROLE_PERMISSIONS[r]?.has(permission));
}

/** Every portal this account may open, with its home first. */
export function portalsOf(s: RoleHolder | null | undefined): { role: UserRole; label: string; path: string }[] {
  const mine = new Set(rolesOf(s));
  return PORTAL_ORDER.filter(([r]) => mine.has(r)).map(([role, path]) => ({ role, label: ROLE_LABELS[role], path }));
}

export function isStaffRole(r: unknown): r is UserRole {
  return typeof r === "string" && (STAFF_ROLE_LIST as string[]).includes(r);
}
