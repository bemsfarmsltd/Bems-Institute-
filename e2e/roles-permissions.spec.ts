import {
  test,
  expect,
  type Browser,
  type BrowserContext,
  type Page
} from "@playwright/test";
import { E2E_PASSWORD, E2E_USERS, type TestRole } from "./test-data";

const API_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:4020";
const PORTAL_PATHS = ["/admin", "/finance", "/admissions", "/management", "/tutor"];

const homePaths: Record<TestRole, string[]> = {
  ADMIN: ["/admin"],
  FINANCE: ["/finance"],
  ADMISSIONS: ["/admissions"],
  MANAGEMENT: ["/management"],
  INSTRUCTOR: ["/tutor"],
  STUDENT: ["/dashboard", "/welcome"]
};

const allowedPortals: Record<TestRole, string[]> = {
  ADMIN: PORTAL_PATHS,
  FINANCE: ["/finance"],
  ADMISSIONS: ["/admissions"],
  MANAGEMENT: ["/management", "/admissions"],
  INSTRUCTOR: ["/tutor"],
  STUDENT: []
};

let pageErrors: string[] = [];
let serverErrors: string[] = [];
let extraContexts: BrowserContext[] = [];

async function resetE2EState() {
  const connectionString = process.env.DATABASE_URL;
  if (process.env.E2E_TEST_DATABASE !== "1" || !connectionString) {
    throw new Error("Browser tests require the isolated E2E database.");
  }

  const database = new URL(connectionString);
  if (
    !["localhost", "127.0.0.1"].includes(database.hostname) ||
    database.pathname !== "/bems_e2e_test"
  ) {
    throw new Error("Browser tests are restricted to the local bems_e2e_test database.");
  }

  const { prisma } = await import("../backend/src/lib/prisma");
  const management = await prisma.user.findUniqueOrThrow({
    where: { email: "e2e-management@example.test" },
    select: { id: true }
  });
  const student = await prisma.user.findUniqueOrThrow({
    where: { email: "e2e-student@example.test" },
    select: { id: true }
  });
  const course = await prisma.course.findUniqueOrThrow({
    where: { slug: "e2e-test-course" },
    select: { id: true }
  });
  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    select: { id: true }
  });

  await prisma.auditEvent.deleteMany({
    where: {
      action: { in: ["enrollment.approved", "staff.roles_changed"] },
      targetId: { in: [management.id, enrollment.id] }
    }
  });
  await prisma.user.update({
    where: { id: management.id },
    data: { role: "MANAGEMENT", extraRoles: ["ADMISSIONS"], tokenVersion: 0 }
  });
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "PENDING",
      paymentPlan: "full",
      amountPaid: 1000,
      totalDue: 1000,
      paymentStatus: "PAID_FULL",
      paymentReference: "e2e-paid-registration",
      source: "e2e"
    }
  });
}

function watchPage(page: Page) {
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 500) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });
}

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  serverErrors = [];
  extraContexts = [];
  watchPage(page);
  await resetE2EState();
});

test.afterEach(async () => {
  await Promise.all(extraContexts.map((context) => context.close()));
  expect(pageErrors, "uncaught page errors").toEqual([]);
  expect(serverErrors, "HTTP 5xx responses").toEqual([]);
});

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByPlaceholder("E-mail").fill(email);
  await page.getByPlaceholder("*********").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Login" }).click();
  // Wait until the session cookie is set and the site has moved on from /login.
  await page.waitForURL((url) => url.pathname !== "/login");
}

async function waitForPortal(page: Page) {
  await expect(page.getByText("Loading portal…")).toBeHidden();
}

async function newTrackedPage(browser: Browser) {
  const context = await browser.newContext();
  extraContexts.push(context);
  const page = await context.newPage();
  watchPage(page);
  return page;
}

for (const account of E2E_USERS) {
  test(`${account.name} signs in and respects portal access`, async ({ page }) => {
    await signIn(page, account.email);
    await expect
      .poll(() => homePaths[account.role].includes(new URL(page.url()).pathname))
      .toBe(true);

    for (const portalPath of PORTAL_PATHS) {
      await page.goto(portalPath);
      await waitForPortal(page);
      const accessDenied = page.getByRole("heading", {
        name: "You don't have access to this portal"
      });

      if (allowedPortals[account.role].includes(portalPath)) {
        await expect(accessDenied).not.toBeVisible();
      } else {
        await expect(accessDenied).toBeVisible();
      }
    }
  });
}

test("Admissions approves a paid registration and Management sees the audit event", async ({
  page,
  browser
}) => {
  await signIn(
    page,
    E2E_USERS.find((account) => account.key === "admissions")!.email
  );
  await expect(page.getByText("E2E Student")).toBeVisible();
  await page.getByRole("button", { name: "Approve Seat" }).click();
  await expect(
    page.getByText("Confirmed E2E Student for E2E Test Course.")
  ).toBeVisible();

  const managementPage = await newTrackedPage(browser);
  await signIn(
    managementPage,
    E2E_USERS.find((account) => account.key === "management")!.email
  );
  await managementPage.getByRole("button", { name: "Audit Log" }).click();
  // The action also appears as an option in the audit filter, so match the list entry.
  await expect(managementPage.locator("span").filter({ hasText: /^enrollment.approved$/ }).first()).toBeVisible();
});

test("Admin changes extra roles, audits it, and signs out the old session", async ({
  page,
  browser
}) => {
  const managementPage = page;
  await signIn(
    managementPage,
    E2E_USERS.find((account) => account.key === "management")!.email
  );
  await managementPage.goto("/admissions");
  await expect(
    managementPage.getByRole("heading", { name: "Registrations, Leads & Roster" })
  ).toBeVisible();

  const adminPage = await newTrackedPage(browser);
  await signIn(
    adminPage,
    E2E_USERS.find((account) => account.key === "admin")!.email
  );
  if (adminPage.viewportSize()?.width === 375) {
    await adminPage.locator("header").getByRole("button").first().click();
  }
  await adminPage
    .getByRole("button", { name: "Admin Settings", exact: true })
    .first()
    .click();
  await adminPage.getByRole("button", { name: "Staff & Access" }).click();

  const roleEditor = adminPage
    .getByRole("combobox", { name: "Main role for E2E Management" })
    .locator("xpath=..");
  const admissionsRole = roleEditor.getByRole("checkbox", { name: "Admissions" });
  const saveRoles = roleEditor.getByRole("button", { name: "Save roles" });
  await admissionsRole.uncheck();
  await saveRoles.click();
  await expect(
    adminPage.getByText(
      "Updated E2E Management's roles (they will need to sign in again)."
    )
  ).toBeVisible();

  const session = await managementPage.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/api/auth/me`, {
      credentials: "include"
    });
    return { status: response.status, body: await response.json() };
  }, API_URL);
  expect(session).toEqual({ status: 200, body: { user: null } });

  await adminPage.getByRole("button", { name: "Audit log", exact: true }).click();
  await expect(adminPage.locator("span").filter({ hasText: /^staff.roles_changed$/ }).first()).toBeVisible();

  await adminPage.getByRole("button", { name: "Staff & Access" }).click();
  await admissionsRole.check();
  // Wait for the save itself before reading the roles back.
  const saved = adminPage.waitForResponse(
    (response) =>
      /\/api\/admin\/staff\/[^/]+\/role$/.test(new URL(response.url()).pathname) &&
      response.request().method() !== "GET"
  );
  await saveRoles.click();
  expect((await saved).ok()).toBe(true);
  const restoredRoles = await adminPage.evaluate(async (apiUrl) => {
    const response = await fetch(`${apiUrl}/api/admin/staff`, {
      credentials: "include"
    });
    const data = await response.json();
    const member = (data.staff || data.users || []).find(
      (candidate: { email: string }) => candidate.email === "e2e-management@example.test"
    );
    return member?.roles;
  }, API_URL);
  expect(restoredRoles).toContain("ADMISSIONS");

  await managementPage.reload();
  await expect(
    managementPage.getByRole("heading", { name: "Sign in required" })
  ).toBeVisible();
});

test("Management with Admissions has a responsive portal switcher", async ({
  page
}) => {
  await signIn(
    page,
    E2E_USERS.find((account) => account.key === "management")!.email
  );

  if (page.viewportSize()?.width === 375) {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    await expect(page.getByText("My portals")).toBeVisible();
  }

  await expect(page.getByRole("link", { name: "Management", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admissions", exact: true })).toBeVisible();
});
