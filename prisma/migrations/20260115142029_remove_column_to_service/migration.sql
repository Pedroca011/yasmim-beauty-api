/*
  Warnings:

  - You are about to drop the column `globalService` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `_ServiceProviders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ServiceProviders" DROP CONSTRAINT "_ServiceProviders_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceProviders" DROP CONSTRAINT "_ServiceProviders_B_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "globalService";

-- DropTable
DROP TABLE "_ServiceProviders";
