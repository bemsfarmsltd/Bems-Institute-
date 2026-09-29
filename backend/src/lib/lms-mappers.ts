import type {
  LMSCourse,
  Module as LMSModule,
  Lesson as LMSLesson,
  Quiz,
  QuizQuestion,
  Assignment,
  Submission,
  Certificate,
  AdminCourse
} from "@/types/lms";
import type {
  Course as DbCourse,
  Module as DbModule,
  Lesson as DbLesson,
  Quiz as DbQuiz,
  Question as DbQuestion,
  Assignment as DbAssignment,
  Submission as DbSubmission,
  Certificate as DbCertificate,
  User as DbUser
} from "@prisma/client";

type CourseWithContent = DbCourse & {
  modules: (DbModule & { lessons: DbLesson[] })[];
};

export function mapCourse(course: CourseWithContent): LMSCourse {
  return {
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
    finalProject: course.finalProject,
    modules: [...course.modules]
      .sort((a, b) => a.order - b.order)
      .map(mapModule)
  };
}

function mapModule(mod: DbModule & { lessons: DbLesson[] }): LMSModule {
  return {
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: [...mod.lessons].sort((a, b) => a.order - b.order).map(mapLesson)
  };
}

function mapLesson(lesson: DbLesson): LMSLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    duration: lesson.duration,
    videoUrl: lesson.videoUrl || "",
    description: lesson.description,
    isFreePreview: lesson.isFreePreview
  };
}

type QuizWithQuestions = DbQuiz & { questions: DbQuestion[] };

export function mapQuiz(quiz: QuizWithQuestions): Quiz {
  return {
    id: quiz.id,
    courseId: quiz.courseId,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map(mapQuestion)
  };
}

function mapQuestion(q: DbQuestion): QuizQuestion {
  return {
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    correctOption: q.correctOption,
    explanation: q.explanation || ""
  };
}

export function mapAssignment(a: DbAssignment): Assignment {
  return {
    id: a.id,
    courseId: a.courseId,
    title: a.title,
    brief: a.brief,
    requirements: a.requirements,
    rubric: a.rubric as { criteria: string; points: number }[]
  };
}

type SubmissionWithRelations = DbSubmission & {
  user: Pick<DbUser, "name" | "email">;
  assignment: Pick<DbAssignment, "courseId">;
};

export function mapSubmission(s: SubmissionWithRelations): Submission {
  return {
    id: s.id,
    assignmentId: s.assignmentId,
    courseId: s.assignment.courseId,
    userId: s.userId,
    studentName: s.user.name,
    studentEmail: s.user.email,
    githubUrl: s.githubUrl,
    liveDemoUrl: s.liveDemoUrl || "",
    notes: s.notes || "",
    status: s.status,
    score: s.score ?? undefined,
    feedback: s.feedback ?? undefined,
    gradedBy: s.gradedBy ?? undefined,
    gradedAt: s.gradedAt ? s.gradedAt.toISOString() : undefined,
    submittedAt: s.createdAt.toISOString()
  };
}

type CertificateWithRelations = DbCertificate & {
  user: Pick<DbUser, "name">;
  course: Pick<DbCourse, "title">;
};

export function mapCertificate(c: CertificateWithRelations): Certificate {
  return {
    id: c.id,
    certNumber: c.certNumber,
    userId: c.userId,
    studentName: c.user.name,
    courseId: c.courseId,
    courseTitle: c.course.title,
    gradeTitle: c.gradeTitle,
    finalScore: c.finalScore,
    issuedAt: c.issuedAt.toISOString(),
    qrVerifyUrl: c.qrVerifyUrl
  };
}

type CourseWithCounts = DbCourse & {
  modules: { lessons: unknown[] }[];
  _count: { enrollments: number };
};

export function mapAdminCourse(course: CourseWithCounts): AdminCourse {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    badge: course.badge,
    tutor: course.tutor,
    tutorRole: course.tutorRole,
    priceFull: course.priceFull,
    priceParts: course.priceParts,
    deposit: course.deposit,
    delivery: course.delivery,
    schedule: course.schedule,
    enrolledCount: course._count.enrollments,
    status: course.status,
    modulesCount: course.modules.length
  };
}

export const DELIVERY_MODE_LABEL: Record<string, "Physical Lab (Umuahia)" | "Virtual Live Zoom"> = {
  PHYSICAL_LAB: "Physical Lab (Umuahia)",
  VIRTUAL_ZOOM: "Virtual Live Zoom"
};
