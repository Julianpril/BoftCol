-- AlterTable
ALTER TABLE "SupportSession" ADD COLUMN "isHumanTakeover" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SupportSession" ADD COLUMN "clientName" TEXT;

-- AlterTable
ALTER TABLE "SupportMessage" ADD COLUMN "sentByAdmin" BOOLEAN NOT NULL DEFAULT false;
