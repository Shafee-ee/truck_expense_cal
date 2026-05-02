-- CreateTable
CREATE TABLE "TruckMaintenance" (
    "id" TEXT NOT NULL,
    "truckNumber" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TruckMaintenance_pkey" PRIMARY KEY ("id")
);
