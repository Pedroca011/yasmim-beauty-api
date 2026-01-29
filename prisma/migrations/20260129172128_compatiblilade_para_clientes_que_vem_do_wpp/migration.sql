/*
  Warnings:

  - You are about to alter the column `currentPrice` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Money` to `Decimal(10,2)`.
  - You are about to alter the column `promotionalPrice` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Money` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserSource" AS ENUM ('WEB', 'WHATSAPP', 'APP');

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "currentPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "promotionalPrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "source" "UserSource" NOT NULL DEFAULT 'WEB',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
