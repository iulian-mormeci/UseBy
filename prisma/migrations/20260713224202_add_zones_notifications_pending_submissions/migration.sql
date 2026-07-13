-- CreateEnum
CREATE TYPE "PendingProductSubmissionStatus" AS ENUM ('PENDING', 'EMAILED', 'INCLUDED', 'REJECTED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "StockItem" ADD COLUMN     "leadDays" INTEGER,
ADD COLUMN     "zoneId" INTEGER;

-- CreateTable
CREATE TABLE "Zone" (
    "id" SERIAL NOT NULL,
    "locationId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingProductSubmission" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "status" "PendingProductSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingProductSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "defaultLeadDays" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zone_locationId_name_key" ON "Zone"("locationId", "name");

-- CreateIndex
CREATE INDEX "PendingProductSubmission_barcode_idx" ON "PendingProductSubmission"("barcode");

-- CreateIndex
CREATE INDEX "PendingProductSubmission_status_idx" ON "PendingProductSubmission"("status");

-- CreateIndex
CREATE INDEX "StockItem_zoneId_idx" ON "StockItem"("zoneId");

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingProductSubmission" ADD CONSTRAINT "PendingProductSubmission_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
