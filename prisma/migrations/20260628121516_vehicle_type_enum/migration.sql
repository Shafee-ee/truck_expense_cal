/*
  Warnings:

  - The `vehicleType` column on the `Truck` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'TEMPO', 'CAR');

-- AlterTable
ALTER TABLE "Truck" DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleType" "VehicleType";
