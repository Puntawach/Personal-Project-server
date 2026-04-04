/*
  Warnings:

  - You are about to alter the column `daily_rate` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `allowance_per_day` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "daily_rate" SET DATA TYPE INTEGER,
ALTER COLUMN "allowance_per_day" SET DATA TYPE INTEGER;
