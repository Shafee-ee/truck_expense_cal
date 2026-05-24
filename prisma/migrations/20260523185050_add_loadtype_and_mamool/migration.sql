/*
  Warnings:

  - The values [BROKER] on the enum `ExpenseCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `dailyFixedCost` on the `Truck` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('COMPANY', 'EXTERNAL');

-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseCategory_new" AS ENUM ('FUEL', 'TOLL', 'POLICE', 'LOADING', 'UNLOADING', 'REPAIR', 'OTHER');
ALTER TABLE "Expense" ALTER COLUMN "category" TYPE "ExpenseCategory_new" USING ("category"::text::"ExpenseCategory_new");
ALTER TYPE "ExpenseCategory" RENAME TO "ExpenseCategory_old";
ALTER TYPE "ExpenseCategory_new" RENAME TO "ExpenseCategory";
DROP TYPE "ExpenseCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "loadType" "LoadType" NOT NULL DEFAULT 'EXTERNAL',
ADD COLUMN     "mamool" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Truck" DROP COLUMN "dailyFixedCost";
