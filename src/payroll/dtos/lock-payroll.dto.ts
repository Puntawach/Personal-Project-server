import { IsInt, Min, Max } from 'class-validator';

export class LockPayrollDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  year: number;
}
