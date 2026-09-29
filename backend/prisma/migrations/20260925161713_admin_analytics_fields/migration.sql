-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'UPCOMING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('PHYSICAL_LAB', 'VIRTUAL_ZOOM');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID_FULL');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#7928CA',
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "cohortId" TEXT,
ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'PHYSICAL_LAB',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalDue" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "targetStudents" INTEGER NOT NULL DEFAULT 80,
    "targetRevenue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrScan" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QrScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QrScan_source_idx" ON "QrScan"("source");

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;
