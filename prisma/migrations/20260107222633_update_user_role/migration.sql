/*
  Warnings:

  - You are about to drop the column `roleId` on the `UserRole` table. All the data in the column will be lost.
  - Added the required column `roleName` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "roleId",
ADD COLUMN     "roleName" "RoleName" NOT NULL;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
