-- CreateTable
CREATE TABLE "BotSession" (
    "id" TEXT NOT NULL,
    "remoteJid" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "data" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotSession_remoteJid_key" ON "BotSession"("remoteJid");
