/*
  Warnings:

  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `roleName` on the `UserRole` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusAppointment" AS ENUM ('SCHEDULED', 'PROGRESS', 'CONCLUDED');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleName_fkey";

-- DropIndex
DROP INDEX "User_roleId_key";

-- DropIndex
DROP INDEX "UserRole_roleId_key";

-- DropIndex
DROP INDEX "UserRole_roleName_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId";

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "roleName";

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "currentPrice" MONEY NOT NULL,
    "promotionalPrice" MONEY,
    "duration" INTEGER NOT NULL,
    "globalService" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "StatusAppointment" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "canceledById" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ServiceProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceProviders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AppointmentServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppointmentServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceProviders_B_index" ON "_ServiceProviders"("B");

-- CreateIndex
CREATE INDEX "_AppointmentServices_B_index" ON "_AppointmentServices"("B");

-- AddForeignKey
ALTER TABLE "_ServiceProviders" ADD CONSTRAINT "_ServiceProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceProviders" ADD CONSTRAINT "_ServiceProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentServices" ADD CONSTRAINT "_AppointmentServices_A_fkey" FOREIGN KEY ("A") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentServices" ADD CONSTRAINT "_AppointmentServices_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
