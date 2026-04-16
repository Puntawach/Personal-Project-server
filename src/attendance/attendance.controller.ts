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
import { CheckOutDto } from './dtos/attendance-check-out.dto';
import { Roles } from 'src/auth/decorators/role.decorator';

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

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('employee/:employeeId')
  getAttendanceByEmployee(@Param('employeeId') employeeId: string) {
    return this.attendanceService.getAttendanceByEmployee(employeeId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':attendanceId/approve')
  approve(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.approve(attendanceId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':attendanceId/reject')
  reject(@Param('attendanceId') attendanceId: string) {
    return this.attendanceService.reject(attendanceId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/all')
  getAllByMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.attendanceService.getAllByMonth(month, year);
  }
}
