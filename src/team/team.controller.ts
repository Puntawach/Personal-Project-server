import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dtos/create-team.dto';
import { UpdateTeam } from './dtos/update-team.dto';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get()
  getAllTeam() {
    return this.teamService.getAllTeam();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  updateTeam(@Param('id') id: string, @Body() updateTeam: UpdateTeam) {
    return this.teamService.updateTeam(id, updateTeam);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teamService.deleteTeam(id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':teamId/members/:employeeId')
  addMember(
    @Param('teamId') teamId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.teamService.addMember(teamId, employeeId);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':teamId/members/:employeeId')
  removeMember(@Param('employeeId') employeeId: string) {
    return this.teamService.removeMember(employeeId);
  }
}
