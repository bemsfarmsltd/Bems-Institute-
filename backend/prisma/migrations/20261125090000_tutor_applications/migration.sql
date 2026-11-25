-- CreateEnum
CREATE TYPE "TutorApplicationStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERVIEW', 'HIRED', 'DECLINED');

-- CreateTable
CREATE TABLE "TutorApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "track" TEXT NOT NULL,
    "teachingMode" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "status" "TutorApplicationStatus" NOT NULL DEFAULT 'NEW',
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorApplication_status_createdAt_idx" ON "TutorApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TutorApplication_email_idx" ON "TutorApplication"("email");

