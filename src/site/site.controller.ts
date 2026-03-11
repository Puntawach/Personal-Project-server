import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSiteDto } from './dtos/create-site.dto';
import { SiteService } from './site.service';
import { UpdateSiteDto } from './dtos/update-site.dto';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  createSite(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.createSite(createSiteDto);
  }

  @Get()
  getAllSite() {
    return this.siteService.getAllSite();
  }

  @Patch(':id')
  updateSite(@Param('id') id: string, @Body() updateSite: UpdateSiteDto) {
    return this.siteService.updateSite(id, updateSite);
  }

  @Delete(':id')
  deleteSite(@Param('id') id: string) {
    return this.siteService.deleteSite(id);
  }
}
