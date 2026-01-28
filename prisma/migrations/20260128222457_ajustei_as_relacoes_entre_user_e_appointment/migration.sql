/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `opeIntervalInMinutes` on the `OpeningHours` table. All the data in the column will be lost.
  - Added the required column `clientId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professionalId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openIntervalInMinutes` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "serviceId",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "professionalId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OpeningHours" DROP COLUMN "opeIntervalInMinutes",
ADD COLUMN     "openIntervalInMinutes" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
