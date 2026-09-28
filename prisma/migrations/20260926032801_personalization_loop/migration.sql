-- CreateEnum
CREATE TYPE "LearningEventType" AS ENUM ('LESSON_STARTED', 'LESSON_COMPLETED', 'QUIZ_STARTED', 'QUESTION_ANSWERED', 'QUIZ_COMPLETED', 'ASSIGNMENT_SUBMITTED', 'ASSIGNMENT_GRADED', 'AI_TUTOR_USED');

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "parentConceptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonConcept" (
    "lessonId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "LessonConcept_pkey" PRIMARY KEY ("lessonId","conceptId")
);

-- CreateTable
CREATE TABLE "QuestionConcept" (
    "questionId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "QuestionConcept_pkey" PRIMARY KEY ("questionId","conceptId")
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "lessonId" TEXT,
    "conceptId" TEXT,
    "eventType" "LearningEventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConceptMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "masteryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConceptMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningGoal" TEXT,
    "experienceLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "learningStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Concept_courseId_idx" ON "Concept"("courseId");

-- CreateIndex
CREATE INDEX "LessonConcept_conceptId_idx" ON "LessonConcept"("conceptId");

-- CreateIndex
CREATE INDEX "QuestionConcept_conceptId_idx" ON "QuestionConcept"("conceptId");

-- CreateIndex
CREATE INDEX "LearningEvent_userId_idx" ON "LearningEvent"("userId");

-- CreateIndex
CREATE INDEX "LearningEvent_conceptId_idx" ON "LearningEvent"("conceptId");

-- CreateIndex
CREATE INDEX "ConceptMastery_conceptId_idx" ON "ConceptMastery"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptMastery_userId_conceptId_key" ON "ConceptMastery"("userId", "conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProfile_userId_key" ON "LearningProfile"("userId");

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Concept" ADD CONSTRAINT "Concept_parentConceptId_fkey" FOREIGN KEY ("parentConceptId") REFERENCES "Concept"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "LessonConcept" ADD CONSTRAINT "LessonConcept_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonConcept" ADD CONSTRAINT "LessonConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionConcept" ADD CONSTRAINT "QuestionConcept_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionConcept" ADD CONSTRAINT "QuestionConcept_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptMastery" ADD CONSTRAINT "ConceptMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConceptMastery" ADD CONSTRAINT "ConceptMastery_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProfile" ADD CONSTRAINT "LearningProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
