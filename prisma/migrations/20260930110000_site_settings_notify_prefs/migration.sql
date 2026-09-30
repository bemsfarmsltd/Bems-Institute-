-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyCategories" "NotificationCategory"[] DEFAULT ARRAY['CLASS', 'GRADING', 'PAYMENT', 'GAMIFICATION', 'ATTENDANCE']::"NotificationCategory"[];

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteName" TEXT NOT NULL DEFAULT 'BEMS Institute of Technology & Vocational Studies',
    "copyrightText" TEXT NOT NULL DEFAULT '',
    "siteEmail" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "contactAddress" TEXT NOT NULL DEFAULT '',
    "allowRegistration" TEXT NOT NULL DEFAULT 'enable',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
