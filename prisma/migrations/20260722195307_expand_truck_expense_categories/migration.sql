/*
  Warnings:

  - You are about to drop the column `tripId` on the `TruckExpense` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TruckExpenseCategory" ADD VALUE 'FUEL';
ALTER TYPE "TruckExpenseCategory" ADD VALUE 'TOLL';
ALTER TYPE "TruckExpenseCategory" ADD VALUE 'LOADING';
ALTER TYPE "TruckExpenseCategory" ADD VALUE 'POLICE';
ALTER TYPE "TruckExpenseCategory" ADD VALUE 'DRIVER_PAYMENT';

-- DropForeignKey
ALTER TABLE "TruckExpense" DROP CONSTRAINT "TruckExpense_tripId_fkey";

-- AlterTable
ALTER TABLE "TruckExpense" DROP COLUMN "tripId";
