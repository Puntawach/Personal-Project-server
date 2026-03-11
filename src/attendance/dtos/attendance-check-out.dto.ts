import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class CheckOutDto {
  @IsDateString()
  @IsNotEmpty()
  checkOutTime: string;

  @IsString()
  @IsOptional()
  workDescription?: string;

  @IsString()
  @IsOptional()
  issues?: string;
}
