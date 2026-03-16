import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Team } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeam } from './dtos/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTeam() {
    return this.prisma.team.findMany({
      where: { deletedAt: null },
      include: {
        employees: {
          where: {
            status: 'ACTIVE',
            role: { in: ['WORKER', 'LEADER'] },
          },
        },
        leader: true,
      },
    });
  }
  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    return await this.prisma.team.create({ data: createTeamDto });
  }

  async updateTeam(id: string, updateTeam: UpdateTeam): Promise<Team> {
    console.log('update', updateTeam);
    return await this.prisma.team.update({
      where: { id },
      data: updateTeam,
    });
  }

  async deleteTeam(id: string) {
    return await this.prisma.team.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addMember(teamId: string, employeeId: string) {
    const data = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!data) {
      throw new NotFoundException('Employee not found');
    }

    if (data.teamId && data.teamId !== teamId) {
      throw new BadRequestException('Employee already belongs to another team');
    }

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { teamId },
    });
  }

  async removeMember(employeeId: string) {
    const data = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!data) {
      throw new NotFoundException('Employee not found');
    }

    if (!data.teamId) {
      throw new BadRequestException('Employee is not in any team');
    }

    return this.prisma.employee.update({
      where: { id: employeeId },
      data: { teamId: null },
    });
  }
}
