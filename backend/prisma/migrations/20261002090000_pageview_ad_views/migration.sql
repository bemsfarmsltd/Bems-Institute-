-- AlterTable
ALTER TABLE "Cohort" ADD COLUMN     "estimatedAdViews" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_page_visitorId_idx" ON "PageView"("page", "visitorId");

-- CreateIndex
CREATE INDEX "PageView_page_createdAt_idx" ON "PageView"("page", "createdAt");

