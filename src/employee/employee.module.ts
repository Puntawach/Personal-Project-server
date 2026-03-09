import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { SecurityModule } from 'src/shared/security/security.module';
import { UploadModule } from 'src/shared/upload/upload.module';

@Module({
  imports: [SecurityModule, UploadModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
