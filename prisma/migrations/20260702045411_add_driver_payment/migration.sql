/*
  Warnings:

  - The values [SALARY] on the enum `TruckExpenseCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "ExpenseCategory" ADD VALUE 'DRIVER_PAYMENT';

-- AlterEnum
BEGIN;
CREATE TYPE "TruckExpenseCategory_new" AS ENUM ('TYRE', 'REPAIR', 'ELECTRICAL', 'INSURANCE', 'ROAD_TAX', 'PERMIT', 'NATIONAL_PERMIT', 'FITNESS', 'WASHING', 'ADD_BLUE', 'OTHER');
ALTER TABLE "TruckExpense" ALTER COLUMN "category" TYPE "TruckExpenseCategory_new" USING ("category"::text::"TruckExpenseCategory_new");
ALTER TYPE "TruckExpenseCategory" RENAME TO "TruckExpenseCategory_old";
ALTER TYPE "TruckExpenseCategory_new" RENAME TO "TruckExpenseCategory";
DROP TYPE "TruckExpenseCategory_old";
COMMIT;
