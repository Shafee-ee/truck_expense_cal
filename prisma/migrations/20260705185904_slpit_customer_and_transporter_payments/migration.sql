/*
  Warnings:

  - You are about to drop the column `clientName` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `transporter` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_tripId_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "clientName",
DROP COLUMN "transporter",
ADD COLUMN     "clientCompanyId" TEXT,
ADD COLUMN     "transporterAdvance" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "transporterCharges" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "transporterCompanyId" TEXT,
ADD COLUMN     "transporterFreight" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Payment";

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "type" "PaymentType" NOT NULL,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransporterPayment" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransporterPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterPayment" ADD CONSTRAINT "TransporterPayment_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_transporterCompanyId_fkey" FOREIGN KEY ("transporterCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
