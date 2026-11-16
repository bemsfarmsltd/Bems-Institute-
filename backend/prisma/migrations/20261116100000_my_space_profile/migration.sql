-- My Space welcome answers (additive, nullable).
ALTER TABLE "LearningProfile" ADD COLUMN "goalType" TEXT,
ADD COLUMN "weeklyHours" INTEGER,
ADD COLUMN "motivation" TEXT,
ADD COLUMN "onboardedAt" TIMESTAMP(3),
ALTER COLUMN "experienceLevel" DROP NOT NULL,
ALTER COLUMN "experienceLevel" DROP DEFAULT;

-- Nobody has answered the welcome setup yet: the stored BEGINNER values are
-- the old column default, not answers.
UPDATE "LearningProfile" SET "experienceLevel" = NULL;
