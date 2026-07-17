-- DropForeignKey
ALTER TABLE "Truck" DROP CONSTRAINT "Truck_companyId_fkey";

-- AlterTable
ALTER TABLE "Truck" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Truck" ADD CONSTRAINT "Truck_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
