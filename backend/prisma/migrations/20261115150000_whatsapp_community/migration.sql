-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "communityInviteSentAt" TIMESTAMP(3);
-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "whatsappCommunityUrl" TEXT NOT NULL DEFAULT '';
