-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'DROPPED';

-- AlterTable
ALTER TABLE "JobPlacement" ADD COLUMN     "payRate" INTEGER;

-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN     "recordingUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "secondChanceUsedAt" TIMESTAMP(3);

