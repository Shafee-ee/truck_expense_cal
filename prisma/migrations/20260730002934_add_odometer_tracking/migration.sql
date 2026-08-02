-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "endOdometer" DOUBLE PRECISION,
ADD COLUMN     "startOdometer" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Truck" ADD COLUMN     "currentOdometer" DOUBLE PRECISION;
