import { IsOptional, IsString } from 'class-validator';

export class UpdateTeam {
  @IsOptional()
  @IsString()
  LeaderId?: string;

  @IsString()
  name: string;
}
