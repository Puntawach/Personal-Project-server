-- AlterTable
ALTER TABLE "PayrollItem" ADD COLUMN     "allowance_snapshot" DECIMAL(10,2),
ADD COLUMN     "daily_rate_snapshot" DECIMAL(10,2);
