
-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "receiptNumber" TEXT;

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "remindedBeforeAt" TIMESTAMP(3),
    "remindedDueAt" TIMESTAMP(3),
    "remindedOverdueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Installment_dueDate_idx" ON "Installment"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_enrollmentId_seq_key" ON "Installment"("enrollmentId", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_receiptNumber_key" ON "PaymentTransaction"("receiptNumber");

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Receipt numbers (lib/receipts.ts).
CREATE SEQUENCE IF NOT EXISTS "receipt_number_seq" START 1;
