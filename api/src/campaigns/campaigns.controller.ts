import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Campaign } from '@adjacent/shared';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @ApiOperation({ summary: 'List campaigns (public), newest window first' })
  @ApiQuery({ name: 'status', required: false, enum: ['upcoming', 'live', 'ended'] })
  @ApiQuery({ name: 'protocol', required: false, example: 'kuru' })
  @ApiOkResponse({ description: 'Campaigns with derived status.' })
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('protocol') protocol?: string,
  ): Promise<Campaign[]> {
    return this.campaigns.findAll({ status, protocol });
  }

  @ApiOperation({ summary: 'Create a campaign (admin only)' })
  @ApiHeader({ name: 'x-admin-key', required: true, description: 'Admin API key' })
  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaigns.create(dto);
  }
}
