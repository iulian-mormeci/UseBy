-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('PACK', 'WEIGHT', 'QUANTITY', 'VOLUME');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "defaultUnit" TEXT NOT NULL DEFAULT 'pcs',
ADD COLUMN     "usageType" "UsageType" NOT NULL DEFAULT 'QUANTITY';

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "currentQuantity" DECIMAL(65,30),
ADD COLUMN     "initialQuantity" DECIMAL(65,30);
