/*
  Warnings:

  - Added the required column `totalPrice` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "totalPrice" DECIMAL(10,2) NOT NULL;
