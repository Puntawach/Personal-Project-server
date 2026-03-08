import { Injectable } from '@nestjs/common';
import { Team } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTeamDto } from './dtos/create-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    return await this.prisma.team.create({ data: createTeamDto });
  }
}
