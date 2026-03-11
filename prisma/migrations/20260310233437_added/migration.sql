-- AlterTable
ALTER TABLE "PayrollPeriod" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" TEXT NOT NULL,
    "normalHours" DOUBLE PRECISION NOT NULL,
    "otHours" DOUBLE PRECISION NOT NULL,
    "workDays" INTEGER NOT NULL,
    "normalPay" DECIMAL(10,2) NOT NULL,
    "otPay" DECIMAL(10,2) NOT NULL,
    "allowance" DECIMAL(10,2) NOT NULL,
    "totalPay" DECIMAL(10,2) NOT NULL,
    "employeeId" TEXT NOT NULL,
    "payrollPeriodId" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollItem_employeeId_payrollPeriodId_key" ON "PayrollItem"("employeeId", "payrollPeriodId");

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
