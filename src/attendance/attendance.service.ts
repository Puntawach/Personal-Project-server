import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckInDto } from './dtos/attendance-check-in.dto';
import {
  Attendance,
  AttendanceStatus,
  Status,
} from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CheckOutDto } from './dtos/attendance-check-out.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(employeeId: string, checkInDto: CheckInDto) {
    const today = new Date(checkInDto.workDate);
    today.setHours(0, 0, 0, 0);

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.status !== Status.ACTIVE) {
      throw new BadRequestException('Employee is not active');
    }

    let attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_workDate: { employeeId, workDate: today },
      },
    });

    if (!attendance) {
      attendance = await this.prisma.attendance.create({
        data: {
          employeeId,
          siteId: checkInDto.siteId,
          workDate: today,
        },
      });
    }

    const activeCheckIn = await this.prisma.checkIn.findFirst({
      where: {
        attendanceId: attendance.id,
        checkOutTime: null,
      },
    });

    if (activeCheckIn) {
      throw new BadRequestException('You already have an active check-in');
    }

    return this.prisma.checkIn.create({
      data: {
        attendanceId: attendance.id,
        checkInTime: new Date(checkInDto.checkInTime),
      },
    });
  }

  async checkOut(
    employeeId: string,
    attendanceId: string,
    checkOutDto: CheckOutDto,
  ) {
    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, employeeId },
      include: { checkIns: true },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (attendance.status !== AttendanceStatus.WORKING) {
      throw new BadRequestException('Attendance is not in WORKING status');
    }

    const activeCheckIn = attendance.checkIns.find((c) => !c.checkOutTime);

    if (!activeCheckIn) {
      throw new BadRequestException('No active check-in found');
    }
    const checkInTime = activeCheckIn.checkInTime;
    const checkOutTime = new Date(checkOutDto.checkOutTime);

    const totalHours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const normalHours = Math.min(totalHours, 8);
    const otHours = Math.max(totalHours - 8, 0);

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        totalHours,
        normalHours,
        otHours, // ✅ คำนวณให้เลย ไม่ต้องส่งมา
        workDescription: checkOutDto.workDescription,
        issues: checkOutDto.issues,
        status: AttendanceStatus.SUBMITTED,
        checkIns: {
          update: {
            where: { id: activeCheckIn.id },
            data: { checkOutTime },
          },
        },
      },
      include: { checkIns: true },
    });
  }

  async getMyAttendance(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      include: {
        checkIns: true,
        site: true,
      },
      orderBy: { workDate: 'desc' },
    });
  }

  async getAttendanceByEmployee(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.attendance.findMany({
      where: { employeeId },
      include: {
        checkIns: true,
        site: true,
      },
      orderBy: { workDate: 'desc' },
    });
  }

  async approve(attendanceId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (attendance.status !== AttendanceStatus.SUBMITTED) {
      throw new BadRequestException('Attendance is not in SUBMITTED status');
    }

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: AttendanceStatus.APPROVED },
    });
  }

  async reject(attendanceId: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (attendance.status !== AttendanceStatus.SUBMITTED) {
      throw new BadRequestException('Attendance is not in SUBMITTED status');
    }

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { status: AttendanceStatus.REJECTED },
    });
  }

  async getAllByMonth(month: number, year: number) {
    return this.prisma.attendance.findMany({
      where: {
        workDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      include: {
        checkIns: true,
        site: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            teamId: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { workDate: 'asc' },
    });
  }
}
