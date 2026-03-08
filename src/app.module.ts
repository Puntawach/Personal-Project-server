import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { ReportModule } from './report/report.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SecurityModule } from './shared/security/security.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    EmployeeModule,
    ReportModule,
    AttendanceModule,
    SecurityModule,
    TeamModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
