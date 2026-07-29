/*
  Warnings:

  - A unique constraint covering the columns `[fastagTransactionId]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "fastagPlazaCode" TEXT,
ADD COLUMN     "fastagPlazaName" TEXT,
ADD COLUMN     "fastagProcessingAt" TIMESTAMP(3),
ADD COLUMN     "fastagTagId" TEXT,
ADD COLUMN     "fastagTransactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_fastagTransactionId_key" ON "Expense"("fastagTransactionId");
