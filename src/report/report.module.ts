import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { UploadModule } from 'src/shared/upload/upload.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [UploadModule, DatabaseModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
