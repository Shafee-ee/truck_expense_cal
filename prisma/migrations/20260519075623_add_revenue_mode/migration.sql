-- CreateEnum
CREATE TYPE "RevenueMode" AS ENUM ('FIXED', 'VARIABLE');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "revenueMode" "RevenueMode" NOT NULL DEFAULT 'FIXED';
