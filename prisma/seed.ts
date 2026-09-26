import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { LMS_COURSES } from "../src/data/lms-data";
import { LMS_QUIZZES, LMS_ASSIGNMENTS } from "../src/data/assessment-data";

process.loadEnvFile(".env.local");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  {
    name: "Chinedu Okeke",
    email: "chinedu.okeke@mouau.edu.ng",
    password: "demo1234",
    role: "STUDENT" as const
  },
  {
    name: "Mr. Victor (Lead Tutor)",
    email: "victor.lead@bemsinstitute.ng",
    password: "demo1234",
    role: "INSTRUCTOR" as const
  }
];

const FINAL_PROJECT_BY_COURSE: Record<string, string> = {
  "web-dev": "A live, fully responsive production website hosted on a public domain",
  "ai-automation": "A working AI/automation mini-tool deployed and functioning for real businesses",
  "product-design": "A full, professional design case study ready for portfolio presentation",
  cybersecurity: "A comprehensive vulnerability assessment and security check-up report"
};

const COLOR_BY_COURSE: Record<string, string> = {
  "web-dev": "#7928CA",
  "ai-automation": "#25D366",
  "product-design": "#F5A623",
  cybersecurity: "#3B82F6"
};

const ACTIVE_COHORT_NAME = "October 2026 (Inaugural FutureSkills)";

async function seedUsers() {
  for (const demo of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(demo.password, 10);
    await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: { name: demo.name, email: demo.email, passwordHash, role: demo.role }
    });
    console.log(`Seeded ${demo.role} demo account: ${demo.email}`);
  }
}

async function seedCourseContent() {
  for (const course of LMS_COURSES) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {
        slug: course.slug,
        title: course.title,
        badge: course.badge,
        tutor: course.tutor,
        tutorRole: course.tutorRole,
        schedule: course.schedule,
        duration: course.duration,
        delivery: course.delivery,
        tagline: course.tagline,
        priceFull: course.priceFull,
        priceParts: course.priceParts,
        deposit: course.deposit,
        finalProject: FINAL_PROJECT_BY_COURSE[course.id] || course.tagline,
        color: COLOR_BY_COURSE[course.id] || "#7928CA"
      },
      create: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        badge: course.badge,
        tutor: course.tutor,
        tutorRole: course.tutorRole,
        schedule: course.schedule,
        duration: course.duration,
        delivery: course.delivery,
        tagline: course.tagline,
        priceFull: course.priceFull,
        priceParts: course.priceParts,
        deposit: course.deposit,
        finalProject: FINAL_PROJECT_BY_COURSE[course.id] || course.tagline,
        color: COLOR_BY_COURSE[course.id] || "#7928CA"
      }
    });

    for (const mod of course.modules) {
      await prisma.module.upsert({
        where: { id: mod.id },
        update: { title: mod.title, order: mod.order, courseId: course.id },
        create: { id: mod.id, title: mod.title, order: mod.order, courseId: course.id }
      });

      for (const [idx, lesson] of mod.lessons.entries()) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: idx + 1,
            isFreePreview: !!lesson.isFreePreview,
            moduleId: mod.id
          },
          create: {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: idx + 1,
            isFreePreview: !!lesson.isFreePreview,
            moduleId: mod.id
          }
        });
      }
    }
    console.log(`Seeded course content: ${course.title}`);
  }
}

async function seedQuizzes() {
  for (const quiz of LMS_QUIZZES) {
    await prisma.quiz.upsert({
      where: { id: quiz.id },
      update: {
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        courseId: quiz.courseId
      },
      create: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.passingScore,
        courseId: quiz.courseId
      }
    });

    for (const q of quiz.questions) {
      await prisma.question.upsert({
        where: { id: q.id },
        update: {
          prompt: q.prompt,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          quizId: quiz.id
        },
        create: {
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          quizId: quiz.id
        }
      });
    }
    console.log(`Seeded quiz: ${quiz.title}`);
  }
}

async function seedAssignments() {
  for (const assignment of LMS_ASSIGNMENTS) {
    await prisma.assignment.upsert({
      where: { id: assignment.id },
      update: {
        title: assignment.title,
        brief: assignment.brief,
        requirements: assignment.requirements,
        rubric: assignment.rubric,
        courseId: assignment.courseId
      },
      create: {
        id: assignment.id,
        title: assignment.title,
        brief: assignment.brief,
        requirements: assignment.requirements,
        rubric: assignment.rubric,
        courseId: assignment.courseId
      }
    });
    console.log(`Seeded assignment: ${assignment.title}`);
  }
}

async function seedCohort() {
  const existing = await prisma.cohort.findFirst({ where: { name: ACTIVE_COHORT_NAME } });
  if (existing) {
    console.log(`Cohort already exists: ${ACTIVE_COHORT_NAME}`);
    return;
  }
  await prisma.cohort.create({
    data: {
      name: ACTIVE_COHORT_NAME,
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-12-31"),
      targetStudents: 80,
      targetRevenue: 6_800_000
    }
  });
  console.log(`Seeded cohort: ${ACTIVE_COHORT_NAME}`);
}

async function main() {
  await seedUsers();
  await seedCourseContent();
  await seedQuizzes();
  await seedAssignments();
  await seedCohort();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
