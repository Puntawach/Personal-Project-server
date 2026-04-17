import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  PayrollItem,
  PayrollPeriod,
} from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { GeneratePayrollDto } from './dtos/generate-payroll.dto';

type AttendanceWithEmployee = {
  employeeId: string;
  normalHours: number;
  otHours: number;
  employee: {
    id: string;
    dailyRate: number | null;
    allowancePerDay: number | null;
  };
};

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async calculateForEmployee(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) return;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        employeeId,
        status: AttendanceStatus.APPROVED,
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    if (attendances.length === 0) return;

    let period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });
    if (!period) {
      period = await this.prisma.payrollPeriod.create({
        data: { month, year },
      });
    }

    const normalHours = attendances.reduce((sum, a) => sum + a.normalHours, 0);
    const otHours = attendances.reduce((sum, a) => sum + a.otHours, 0);
    const workDays = attendances.length;
    const hourlyRate = Number(employee.dailyRate ?? 0) / 8;

    const normalPay = normalHours * hourlyRate;
    const otPay = otHours * hourlyRate * 1.5;
    const allowance = workDays * Number(employee.allowancePerDay ?? 0);
    const totalPay = normalPay + otPay + allowance;

    await this.prisma.attendance.updateMany({
      where: {
        employeeId,
        status: AttendanceStatus.APPROVED,
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      data: { payrollPeriodId: period.id },
    });

    const existing = await this.prisma.payrollItem.findUnique({
      where: {
        employeeId_payrollPeriodId: { employeeId, payrollPeriodId: period.id },
      },
    });

    if (existing) {
      await this.prisma.payrollItem.update({
        where: { id: existing.id },
        data: {
          normalHours,
          otHours,
          workDays,
          normalPay,
          otPay,
          allowance,
          totalPay,
          dailyRateSnapshot: employee.dailyRate,
          allowanceSnapshot: employee.allowancePerDay,
        },
      });
    } else {
      await this.prisma.payrollItem.create({
        data: {
          employeeId,
          payrollPeriodId: period.id,
          normalHours,
          otHours,
          workDays,
          normalPay,
          otPay,
          allowance,
          totalPay,
          dailyRateSnapshot: employee.dailyRate,
          allowanceSnapshot: employee.allowancePerDay,
        },
      });
    }
  }

  async generate(
    generatePayrollDto: GeneratePayrollDto,
  ): Promise<{ period: PayrollPeriod; totalPayout: number }> {
    const { month, year } = generatePayrollDto;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        status: AttendanceStatus.APPROVED,
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      select: { employeeId: true },
      distinct: ['employeeId'],
    });

    if (attendances.length === 0) {
      throw new BadRequestException(
        'No approved attendances found for this period',
      );
    }

    await Promise.all(
      attendances.map(({ employeeId }) =>
        this.calculateForEmployee(employeeId, month, year),
      ),
    );

    return this.getSummary(month, year);
  }

  async getSummary(
    month: number,
    year: number,
  ): Promise<{ period: PayrollPeriod; totalPayout: number }> {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
      include: {
        payrollItems: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                dailyRate: true,
                allowancePerDay: true,
                teamId: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { totalPay: 'desc' },
        },
      },
    });

    if (!period) throw new NotFoundException('Payroll period not found');

    const totalPayout = period.payrollItems.reduce<number>(
      (sum, item) => sum + Number(item.totalPay),
      0,
    );
    return { period, totalPayout };
  }

  async getMyPayroll(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<PayrollItem> {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });
    if (!period) throw new NotFoundException('Payroll period not found');

    const payrollItem = await this.prisma.payrollItem.findUnique({
      where: {
        employeeId_payrollPeriodId: { employeeId, payrollPeriodId: period.id },
      },
      include: { payrollPeriod: true },
    });

    if (!payrollItem)
      throw new NotFoundException('Payroll not found for this period');
    return payrollItem;
  }
}
