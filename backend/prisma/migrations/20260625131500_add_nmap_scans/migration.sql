-- DropForeignKey
ALTER TABLE "scans" DROP CONSTRAINT "scans_assetId_fkey";

-- DropIndex
DROP INDEX "scans_assetId_idx";

-- DropIndex
DROP INDEX "scans_startedAt_idx";

-- AlterTable
ALTER TABLE "scans" DROP COLUMN "assetId",
DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "errorMessage",
DROP COLUMN "startedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "importedById" UUID NOT NULL,
ADD COLUMN     "scanArguments" TEXT,
ADD COLUMN     "scanner" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

-- CreateTable
CREATE TABLE "scan_hosts" (
    "id" UUID NOT NULL,
    "scanId" UUID NOT NULL,
    "assetId" UUID,
    "hostname" TEXT,
    "ipAddress" TEXT NOT NULL,
    "macAddress" TEXT,
    "vendor" TEXT,
    "state" TEXT NOT NULL,
    "operatingSystem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scan_hosts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scan_hosts_scanId_idx" ON "scan_hosts"("scanId");

-- CreateIndex
CREATE INDEX "scan_hosts_assetId_idx" ON "scan_hosts"("assetId");

-- CreateIndex
CREATE INDEX "scan_hosts_ipAddress_idx" ON "scan_hosts"("ipAddress");

-- CreateIndex
CREATE INDEX "scans_importedById_idx" ON "scans"("importedById");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_hosts" ADD CONSTRAINT "scan_hosts_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_hosts" ADD CONSTRAINT "scan_hosts_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
