import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeModule } from 'src/employee/employee.module';
import { SecurityModule } from 'src/shared/security/security.module';

@Module({
  imports: [EmployeeModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
