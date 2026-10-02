-- CreateEnum
CREATE TYPE "LiveSessionType" AS ENUM ('CLASS', 'WELCOME');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('MILESTONE', 'CAPSTONE');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 99,
ADD COLUMN     "type" "AssignmentType" NOT NULL DEFAULT 'CAPSTONE';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "goalStatement" TEXT;

-- AlterTable
ALTER TABLE "LiveSession" ADD COLUMN     "type" "LiveSessionType" NOT NULL DEFAULT 'CLASS';

