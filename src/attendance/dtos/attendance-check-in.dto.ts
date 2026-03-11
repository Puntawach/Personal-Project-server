import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  siteId: string;

  @IsDateString()
  workDate: string;

  @IsString()
  @IsNotEmpty()
  checkInTime: string;
}
