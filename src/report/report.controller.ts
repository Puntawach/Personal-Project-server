import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReportService } from './report.service';
import { ReportImage } from 'src/database/generated/prisma/client';
import { CreateReportDto } from './dtos/create-report.dto';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import { memoryStorage } from 'multer';
import type { Request } from 'express';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  //   Employee endpoints
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body('attendanceId') attendanceId: string,
    @Body('detail') detail: string,
    @CurrentEmployee() employee: JwtPayload,
  ) {
    return this.reportService.create(employee.sub, file, attendanceId, detail);
  }

  @Get('me')
  getMyReports(@CurrentEmployee() employee: JwtPayload) {
    return this.reportService.getMyReports(employee.sub);
  }

  // Admin endpoints
  @Get()
  getAllReports() {
    return this.reportService.getAllReports();
  }

  @Patch(':reportId/approve')
  approve(@Param('reportId') reportId: string) {
    return this.reportService.approve(reportId);
  }

  @Patch(':reportId/reject')
  reject(@Param('reportId') reportId: string) {
    return this.reportService.reject(reportId);
  }
}
