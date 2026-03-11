import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { ReportModule } from './report/report.module';
import { AttendanceModule } from './attendance/attendance.module';
import { SecurityModule } from './shared/security/security.module';
import { TeamModule } from './team/team.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SiteService } from './site/site.service';
import { SiteController } from './site/site.controller';
import { SiteModule } from './site/site.module';
import { PayrollModule } from './payroll/payroll.module';

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
