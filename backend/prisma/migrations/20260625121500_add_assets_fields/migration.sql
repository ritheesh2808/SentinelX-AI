ALTER TYPE "AssetStatus" ADD VALUE 'ONLINE';
ALTER TYPE "AssetStatus" ADD VALUE 'OFFLINE';

-- DropIndex
DROP INDEX "assets_ownerId_identifier_key";

-- DropIndex
DROP INDEX "assets_type_idx";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "description",
DROP COLUMN "identifier",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "assetType" "AssetType" NOT NULL,
ADD COLUMN     "criticality" "Severity" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "environment" TEXT NOT NULL DEFAULT 'Production',
ADD COLUMN     "hostname" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "operatingSystem" TEXT,
ALTER COLUMN "status" SET DEFAULT 'ONLINE';

-- CreateIndex
CREATE INDEX "assets_assetType_idx" ON "assets"("assetType");

-- CreateIndex
CREATE UNIQUE INDEX "assets_hostname_ipAddress_key" ON "assets"("hostname", "ipAddress");
