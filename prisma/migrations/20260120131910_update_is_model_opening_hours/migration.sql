/*
  Warnings:

  - You are about to drop the column `closeHour` on the `OpeningHours` table. All the data in the column will be lost.
  - You are about to drop the column `intervalHour` on the `OpeningHours` table. All the data in the column will be lost.
  - You are about to drop the column `openHour` on the `OpeningHours` table. All the data in the column will be lost.
  - Added the required column `closeInMinutes` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `closeIntervalInMinutes` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dayOfWeek` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opeIntervalInMinutes` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openInMinutes` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "OpeningHours" DROP COLUMN "closeHour",
DROP COLUMN "intervalHour",
DROP COLUMN "openHour",
ADD COLUMN     "closeInMinutes" INTEGER NOT NULL,
ADD COLUMN     "closeIntervalInMinutes" INTEGER NOT NULL,
ADD COLUMN     "dayClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dayOfWeek" "DayOfWeek" NOT NULL,
ADD COLUMN     "opeIntervalInMinutes" INTEGER NOT NULL,
ADD COLUMN     "openInMinutes" INTEGER NOT NULL;
