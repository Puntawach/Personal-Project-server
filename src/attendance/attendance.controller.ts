import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentEmployee } from 'src/auth/decorators/current-employee.decorator';
import { CheckInDto } from './dtos/attendance-check-in.dto';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { AttendanceService } from './attendance.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CheckOutDto } from './dtos/attendance-check-out.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(
    @Body() checkInDto: CheckInDto,
    @CurrentEmployee() employee: JwtPayload,
  ) {
    return this.attendanceService.checkIn(employee.sub, checkInDto);
  }

  @Patch(':attendanceId/check-out')
  checkOut(
    @Param('attendanceId') attendanceId: string,
    @Body() checkOutDto: CheckOutDto,
    @CurrentEmployee() employee: JwtPayload,
  ) {
    return this.attendanceService.checkOut(
      employee.sub,
      attendanceId,
      checkOutDto,
    );
  }

  @Get('me')
  getMyAttendance(@CurrentEmployee() employee: JwtPayload) {
    return this.attendanceService.getMyAttendance(employee.sub);
  }

  @Public()
  @Get('employee/:employeeId')
  getAttendanceByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceService.getAttendanceByEmployee(employeeId);
  }
  @Public()
  @Patch(':attendanceId/approve')
  approve(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.approve(attendanceId);
  }
  @Public()
  @Patch(':attendanceId/reject')
  reject(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.reject(attendanceId);
  }

  @Get('admin/all')
  getAllByMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.attendanceService.getAllByMonth(month, year);
  }
}
