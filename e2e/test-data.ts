export type TestRole =
  | "ADMIN"
  | "FINANCE"
  | "ADMISSIONS"
  | "MANAGEMENT"
  | "INSTRUCTOR"
  | "STUDENT";

export const E2E_PASSWORD = "E2E-Browser-Test-Only-2026!";

export const E2E_USERS: {
  key: string;
  name: string;
  email: string;
  role: TestRole;
  extraRoles: TestRole[];
}[] = [
  {
    key: "admin",
    name: "E2E Admin",
    email: "e2e-admin@example.test",
    role: "ADMIN",
    extraRoles: []
  },
  {
    key: "finance",
    name: "E2E Finance",
    email: "e2e-finance@example.test",
    role: "FINANCE",
    extraRoles: []
  },
  {
    key: "admissions",
    name: "E2E Admissions",
    email: "e2e-admissions@example.test",
    role: "ADMISSIONS",
    extraRoles: []
  },
  {
    key: "management",
    name: "E2E Management",
    email: "e2e-management@example.test",
    role: "MANAGEMENT",
    extraRoles: ["ADMISSIONS"]
  },
  {
    key: "tutor",
    name: "E2E Tutor",
    email: "e2e-tutor@example.test",
    role: "INSTRUCTOR",
    extraRoles: []
  },
  {
    key: "student",
    name: "E2E Student",
    email: "e2e-student@example.test",
    role: "STUDENT",
    extraRoles: []
  }
];
