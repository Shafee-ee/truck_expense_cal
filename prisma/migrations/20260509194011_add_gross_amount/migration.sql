/*
  Warnings:

  - A unique constraint covering the columns `[truckNumber,month]` on the table `TruckMaintenance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "grossAmount" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TruckMaintenance" ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TruckMaintenance_truckNumber_month_key" ON "TruckMaintenance"("truckNumber", "month");
