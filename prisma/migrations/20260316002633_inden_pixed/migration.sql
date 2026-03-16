-- DropIndex
DROP INDEX "Employee_identification_id_key";

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "identification_id" SET DATA TYPE TEXT;
