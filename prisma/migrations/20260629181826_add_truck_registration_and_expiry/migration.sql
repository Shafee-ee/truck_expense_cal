/*
  Warnings:

  - The values [TAX] on the enum `TruckExpenseCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fitnessExpiry` on the `Truck` table. All the data in the column will be lost.
  - You are about to drop the column `insuranceExpiry` on the `Truck` table. All the data in the column will be lost.
  - You are about to drop the column `nationalPermitExpiry` on the `Truck` table. All the data in the column will be lost.
  - You are about to drop the column `permitExpiry` on the `Truck` table. All the data in the column will be lost.
  - You are about to drop the column `roadTaxExpiry` on the `Truck` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `TruckExpense` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TruckExpenseCategory_new" AS ENUM ('TYRE', 'REPAIR', 'ELECTRICAL', 'INSURANCE', 'ROAD_TAX', 'PERMIT', 'NATIONAL_PERMIT', 'FITNESS', 'SALARY', 'WASHING', 'ADD_BLUE', 'OTHER');
ALTER TABLE "TruckExpense"
ALTER COLUMN "category"
TYPE "TruckExpenseCategory_new"
USING (
  (
    CASE
      WHEN category::text = 'TAX' THEN 'ROAD_TAX'
      ELSE category::text
    END
  )::"TruckExpenseCategory_new"
);

ALTER TYPE "TruckExpenseCategory" RENAME TO "TruckExpenseCategory_old";
ALTER TYPE "TruckExpenseCategory_new" RENAME TO "TruckExpenseCategory";
DROP TYPE "TruckExpenseCategory_old";

COMMIT;

-- AlterTable
ALTER TABLE "Truck" DROP COLUMN "fitnessExpiry",
DROP COLUMN "insuranceExpiry",
DROP COLUMN "nationalPermitExpiry",
DROP COLUMN "permitExpiry",
DROP COLUMN "roadTaxExpiry";

-- AlterTable
ALTER TABLE "TruckExpense" DROP COLUMN "notes",
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE INDEX "TruckExpense_truckId_category_expenseDate_idx" ON "TruckExpense"("truckId", "category", "expenseDate");
