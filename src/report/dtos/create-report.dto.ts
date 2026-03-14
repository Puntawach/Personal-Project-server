import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  attendanceId: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  detail: string;
}
