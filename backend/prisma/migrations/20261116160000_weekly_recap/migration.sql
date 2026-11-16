-- Weekly recap opt-out and once-per-week marker (additive).
ALTER TABLE "LearningProfile" ADD COLUMN "weeklyRecapEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lastRecapWeekStart" TIMESTAMP(3);
