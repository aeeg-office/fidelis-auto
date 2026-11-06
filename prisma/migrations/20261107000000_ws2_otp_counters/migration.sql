-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneOtpSentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneOtpSentDay" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OtpIpCounter" (
    "ip" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpIpCounter_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE INDEX "OtpIpCounter_windowStart_idx" ON "OtpIpCounter"("windowStart");

