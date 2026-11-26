import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E_PASSWORD, E2E_USERS } from "../../e2e/test-data";

function assertThrowawayDatabase(connectionString: string | undefined) {
  if (process.env.E2E_TEST_DATABASE !== "1" || !connectionString) {
    throw new Error("E2E seed requires E2E_TEST_DATABASE=1 and DATABASE_URL.");
  }

  const database = new URL(connectionString);
  if (
    !["localhost", "127.0.0.1"].includes(database.hostname) ||
    database.pathname !== "/bems_e2e_test"
  ) {
    throw new Error("E2E seed is restricted to the local bems_e2e_test database.");
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  assertThrowawayDatabase(connectionString);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: connectionString! })
  });

  try {
    const passwordHash = await hash(E2E_PASSWORD, 10);
    for (const account of E2E_USERS) {
      await prisma.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          passwordHash,
          role: account.role,
          extraRoles: account.extraRoles,
          deactivatedAt: null,
          tokenVersion: 0
        },
        create: {
          name: account.name,
          email: account.email,
          passwordHash,
          role: account.role,
          extraRoles: account.extraRoles
        }
      });
    }

    const student = await prisma.user.findUniqueOrThrow({
      where: { email: "e2e-student@example.test" },
      select: { id: true }
    });
    const course = await prisma.course.upsert({
      where: { slug: "e2e-test-course" },
      update: { title: "E2E Test Course", status: "ACTIVE", isPublished: true },
      create: {
        slug: "e2e-test-course",
        title: "E2E Test Course",
        tutor: "E2E Tutor",
        tutorRole: "Tutor",
        tagline: "Seeded only for isolated browser tests.",
        priceFull: 1000,
        priceParts: 1000,
        deposit: 1000,
        finalProject: "E2E test project",
        status: "ACTIVE",
        isPublished: true
      }
    });

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: student.id, courseId: course.id }
      },
      update: {
        status: "PENDING",
        paymentPlan: "full",
        amountPaid: 1000,
        totalDue: 1000,
        paymentStatus: "PAID_FULL",
        paymentReference: "e2e-paid-registration",
        source: "e2e"
      },
      create: {
        userId: student.id,
        courseId: course.id,
        status: "PENDING",
        paymentPlan: "full",
        amountPaid: 1000,
        totalDue: 1000,
        paymentStatus: "PAID_FULL",
        paymentReference: "e2e-paid-registration",
        source: "e2e"
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Could not seed E2E database:", error);
  process.exitCode = 1;
});
