import { Injectable } from '@nestjs/common';
import { CreateSiteDto } from './dtos/create-site.dto';
import { Site } from 'src/database/generated/prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateSiteDto } from './dtos/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async createSite(createSite: CreateSiteDto): Promise<Site> {
    return this.prisma.site.create({ data: createSite });
  }

  async getAllSite(): Promise<Site[]> {
    return this.prisma.site.findMany();
  }

  async updateSite(id: string, updateSite: UpdateSiteDto): Promise<Site> {
    return this.prisma.site.update({ where: { id: id }, data: updateSite });
  }

  async deleteSite(id: string): Promise<void> {
    await this.prisma.site.delete({ where: { id } });
  }
}
