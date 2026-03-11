/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `PayrollPeriod` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Site` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'DELETE';

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "PayrollPeriod" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Site" DROP COLUMN "deletedAt";
