-- AlterTable
ALTER TABLE "TruckExpense" ADD COLUMN     "tripId" TEXT;

-- AddForeignKey
ALTER TABLE "TruckExpense" ADD CONSTRAINT "TruckExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
