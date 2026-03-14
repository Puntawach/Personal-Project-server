import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';
import { CreateReportDto } from './dtos/create-report.dto';
import {
  ReportImage,
  ReportStatus,
} from 'src/database/generated/prisma/client';

@Injectable()
export class ReportService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    employeeId: string,
    file: Express.Multer.File,
    attendanceId: string,
    detail: string,
  ): Promise<ReportImage> {
    // 1. verify attendance belongs to employee
    const attendance = await this.prisma.attendance.findFirst({
      where: { id: attendanceId, employeeId },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // 2. upload image to cloudinary
    const result = await this.cloudinaryService.upload(file);

    // 3. save report image to database
    return this.prisma.reportImage.create({
      data: {
        attendanceId: attendanceId,
        imageUrl: result.secure_url,
        detail: detail,
      },
    });
  }

  async getMyReports(employeeId: string): Promise<ReportImage[]> {
    return this.prisma.reportImage.findMany({
      where: {
        deletedAt: null,
        attendance: { employeeId },
      },
      include: {
        attendance: {
          select: {
            workDate: true,
            site: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReports(): Promise<ReportImage[]> {
    return this.prisma.reportImage.findMany({
      where: { deletedAt: null },
      include: {
        attendance: {
          select: {
            workDate: true,
            site: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async approve(reportId: string): Promise<ReportImage> {
    const report = await this.prisma.reportImage.findFirst({
      where: { id: reportId, deletedAt: null },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Report is not in PENDING status');
    }

    return this.prisma.reportImage.update({
      where: { id: reportId },
      data: { status: ReportStatus.APPROVED },
    });
  }

  async reject(reportId: string): Promise<ReportImage> {
    const report = await this.prisma.reportImage.findFirst({
      where: { id: reportId, deletedAt: null },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException('Report is not in PENDING status');
    }

    return this.prisma.reportImage.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.REJECTED,
        deletedAt: new Date(),
      },
    });
  }
}
