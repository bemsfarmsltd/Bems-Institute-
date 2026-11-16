-- My Space welcome answers (additive, nullable).
ALTER TABLE "LearningProfile" ADD COLUMN "goalType" TEXT,
ADD COLUMN "weeklyHours" INTEGER,
ADD COLUMN "motivation" TEXT,
ADD COLUMN "onboardedAt" TIMESTAMP(3);
