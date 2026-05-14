/*
  Warnings:

  - You are about to drop the `TruckMaintenance` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TruckExpenseCategory" AS ENUM ('TYRE', 'REPAIR', 'ELECTRICAL', 'INSURANCE', 'SALARY', 'TAX', 'PERMIT', 'WASHING', 'OTHER');

-- DropTable
DROP TABLE "TruckMaintenance";

-- CreateTable
CREATE TABLE "TruckExpense" (
    "id" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "category" "TruckExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT,
    "notes" TEXT,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TruckExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TruckExpense" ADD CONSTRAINT "TruckExpense_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
