-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "fitnessExpiry" TIMESTAMP(3),
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "nationalPermitExpiry" TIMESTAMP(3),
ADD COLUMN     "registrationDate" TIMESTAMP(3),
ADD COLUMN     "vehicleType" TEXT;
