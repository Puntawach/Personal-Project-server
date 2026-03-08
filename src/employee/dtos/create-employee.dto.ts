import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim';
import { Role, Status } from 'src/database/generated/prisma/enums';

export class CreateEmployeeDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Trim()
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Trim()
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Trim()
  lastName: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsNumber()
  identificationId: number;

  @IsEnum(Role)
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;

  @IsEnum(Status)
  status: Status;

  avatarUrl: string;

  @Type(() => Number)
  @IsNumber()
  dailyRate: number;

  @IsNumber()
  allowancePerDay: number;

  @IsString()
  teamId: string;
}
