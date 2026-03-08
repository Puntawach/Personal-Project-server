import { Body, Controller, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dtos/create-team.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto);
  }
}
