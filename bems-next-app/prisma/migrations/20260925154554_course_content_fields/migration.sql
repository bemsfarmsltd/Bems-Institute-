/*
  Warnings:

  - You are about to drop the column `instructions` on the `Assignment` table. All the data in the column will be lost.
  - Added the required column `brief` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Made the column `rubric` on table `Assignment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "instructions",
ADD COLUMN     "brief" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT[],
ALTER COLUMN "rubric" SET NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "badge" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "delivery" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "duration" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "schedule" TEXT NOT NULL DEFAULT '';
