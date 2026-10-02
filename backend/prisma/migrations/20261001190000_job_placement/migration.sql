-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('SEEKING', 'INTRODUCED', 'HIRED');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('BEMS_INTERNAL', 'PARTNER');

-- CreateEnum
CREATE TYPE "PlacementFeeStatus" AS ENUM ('NONE', 'INVOICED', 'PAID');

-- CreateTable
CREATE TABLE "JobPlacement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'SEEKING',
    "placementType" "PlacementType",
    "employerName" TEXT,
    "hiredAt" TIMESTAMP(3),
    "feeAmount" INTEGER,
    "feeStatus" "PlacementFeeStatus" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPlacement_courseId_idx" ON "JobPlacement"("courseId");

-- CreateIndex
CREATE INDEX "JobPlacement_status_idx" ON "JobPlacement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobPlacement_userId_courseId_key" ON "JobPlacement"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "JobPlacement" ADD CONSTRAINT "JobPlacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPlacement" ADD CONSTRAINT "JobPlacement_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

