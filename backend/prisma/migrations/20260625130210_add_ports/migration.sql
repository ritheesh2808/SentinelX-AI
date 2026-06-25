-- CreateTable
CREATE TABLE "ports" (
    "id" UUID NOT NULL,
    "scanHostId" UUID NOT NULL,
    "portNumber" INTEGER NOT NULL,
    "protocol" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "product" TEXT,
    "version" TEXT,
    "banner" TEXT,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ports_scanHostId_idx" ON "ports"("scanHostId");

-- CreateIndex
CREATE INDEX "ports_portNumber_idx" ON "ports"("portNumber");

-- CreateIndex
CREATE INDEX "ports_riskLevel_idx" ON "ports"("riskLevel");

-- CreateIndex
CREATE INDEX "ports_state_idx" ON "ports"("state");

-- AddForeignKey
ALTER TABLE "ports" ADD CONSTRAINT "ports_scanHostId_fkey" FOREIGN KEY ("scanHostId") REFERENCES "scan_hosts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
