import { IsOptional, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim';

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  @Trim()
  firstName?: string;

  @IsString()
  @IsOptional()
  @Trim()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
