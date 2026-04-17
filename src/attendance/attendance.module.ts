import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { DatabaseModule } from 'src/database/database.module';
import { PayrollModule } from 'src/payroll/payroll.module';

@Module({
  imports: [DatabaseModule, PayrollModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
