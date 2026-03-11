/*
  Warnings:

  - Added the required column `detail` to the `ReportImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PayrollPeriod" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ReportImage" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "detail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Site" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "deletedAt" TIMESTAMP(3);
