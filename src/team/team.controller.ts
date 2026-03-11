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
import { Public } from 'src/auth/decorators/public.decorator';
import { UpdateTeam } from './dtos/update-team.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Public()
  @Get()
  getAllTeam() {
    return this.teamService.getAllTeam();
  }

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto);
  }

  @Public()
  @Patch(':id')
  updateTeam(@Param('id') id: string, @Body() updateTeam: UpdateTeam) {
    return this.teamService.updateTeam(id, updateTeam);
  }

  @Public()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teamService.deleteTeam(id);
  }

  @Public()
  @Patch(':teamId/members/:employeeId')
  addMember(
    @Param('teamId') teamId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.teamService.addMember(teamId, employeeId);
  }

  @Public()
  @Delete(':teamId/members/:employeeId')
  removeMember(@Param('employeeId') employeeId: string) {
    return this.teamService.removeMember(employeeId);
  }
}
