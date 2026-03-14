import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EmployeeModule } from './employee/employee.module';
import { PayrollModule } from './payroll/payroll.module';
import { ReportModule } from './report/report.module';
import { SecurityModule } from './shared/security/security.module';
import { SiteController } from './site/site.controller';
import { SiteModule } from './site/site.module';
import { SiteService } from './site/site.service';
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
    SiteModule,
    PayrollModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    SiteService,
  ],
  controllers: [SiteController],
})
export class AppModule {}
