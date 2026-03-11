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
import { LockPayrollDto } from './dtos/lock-payroll.dto';
import { PrismaService } from 'src/database/prisma.service';
import { GeneratePayrollDto } from './dtos/generate-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async generate(generatePayrollDto: GeneratePayrollDto): Promise<{
    period: PayrollPeriod;
    payrollItems: PayrollItem[];
  }> {
    const { month, year } = generatePayrollDto;

    const attendances = await this.prisma.attendance.findMany({
      where: {
        status: AttendanceStatus.APPROVED,
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: { employee: true },
    });

    if (attendances.length === 0) {
      throw new BadRequestException(
        'No approved attendances found for this period',
      );
    }

    let period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });

    if (!period) {
      period = await this.prisma.payrollPeriod.create({
        data: { month, year },
      });
    }

    if (period.isLocked) {
      throw new BadRequestException(
        'Payroll period is locked, cannot regenerate',
      );
    }

    // 3. group attendances by employee
    const grouped = attendances.reduce(
      (acc: Record<string, { employee: any; attendances: any[] }>, att) => {
        if (!acc[att.employeeId]) {
          acc[att.employeeId] = {
            employee: att.employee,
            attendances: [],
          };
        }
        acc[att.employeeId].attendances.push(att);
        return acc;
      },
      {},
    );

    // 4. calculate payroll per employee
    const payrollItems = await Promise.all(
      Object.values(grouped).map(async ({ employee, attendances }) => {
        const normalHours = attendances.reduce(
          (sum: number, a) => sum + a.normalHours,
          0,
        );
        const otHours = attendances.reduce(
          (sum: number, a) => sum + a.otHours,
          0,
        );
        const workDays = attendances.length;
        const hourlyRate = Number(employee.dailyRate) / 8;

        const normalPay = normalHours * hourlyRate;
        const otPay = otHours * hourlyRate * 1.5;
        const allowance = workDays * Number(employee.allowancePerDay);
        const totalPay = normalPay + otPay + allowance;

        await this.prisma.attendance.updateMany({
          where: {
            employeeId: employee.id,
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
            employeeId_payrollPeriodId: {
              employeeId: employee.id,
              payrollPeriodId: period.id,
            },
          },
        });

        if (existing) {
          return this.prisma.payrollItem.update({
            where: { id: existing.id },
            data: {
              normalHours,
              otHours,
              workDays,
              normalPay,
              otPay,
              allowance,
              totalPay,
            },
          });
        }

        return this.prisma.payrollItem.create({
          data: {
            employeeId: employee.id,
            payrollPeriodId: period.id,
            normalHours,
            otHours,
            workDays,
            normalPay,
            otPay,
            allowance,
            totalPay,
          },
        });
      }),
    );

    return { period, payrollItems };
  }

  async lock(dto: LockPayrollDto): Promise<PayrollPeriod> {
    const { month, year } = dto;

    const period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });

    if (!period) {
      throw new NotFoundException('Payroll period not found, generate first');
    }

    if (period.isLocked) {
      throw new BadRequestException('Payroll period is already locked');
    }

    return this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { isLocked: true },
    });
  }

  // ✅ Get payroll summary (admin)
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
              },
            },
          },
        },
      },
    });

    if (!period) {
      throw new NotFoundException('Payroll period not found');
    }

    const totalPayout = (period.payrollItems as PayrollItem[]).reduce<number>(
      (sum, item) => sum + Number(item.totalPay),
      0,
    );
    return { period, totalPayout };
  }

  // ✅ Get my payroll (employee)
  async getMyPayroll(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<PayrollItem> {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { month_year: { month, year } },
    });

    if (!period) {
      throw new NotFoundException('Payroll period not found');
    }

    const payrollItem = await this.prisma.payrollItem.findUnique({
      where: {
        employeeId_payrollPeriodId: {
          employeeId,
          payrollPeriodId: period.id,
        },
      },
      include: { payrollPeriod: true },
    });

    if (!payrollItem) {
      throw new NotFoundException('Payroll not found for this period');
    }

    return payrollItem;
  }
}
