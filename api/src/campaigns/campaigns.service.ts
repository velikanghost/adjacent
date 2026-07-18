import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  computeCampaignStatus,
  type Campaign as CampaignDto,
  type CampaignStatus,
  type CampaignType,
} from '@adjacent/shared';
import { Campaign, type CampaignDocument } from './schemas/campaign.schema';
import { CreateCampaignDto } from './dto/create-campaign.dto';

export interface CampaignFilter {
  status?: string;
  protocol?: string;
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly model: Model<CampaignDocument>,
  ) {}

  async create(dto: CreateCampaignDto): Promise<CampaignDto> {
    const doc = await this.model.create({
      ...dto,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });
    return this.toDto(doc);
  }

  async findAll(filter: CampaignFilter): Promise<CampaignDto[]> {
    const docs = await this.model.find().sort({ startsAt: 1 }).lean().exec();
    let items = docs.map((d) => this.toDto(d));

    if (filter.protocol) {
      const needle = filter.protocol.toLowerCase();
      items = items.filter((c) =>
        c.protocols.some((p) => p.toLowerCase() === needle),
      );
    }
    if (filter.status) {
      items = items.filter((c) => c.status === (filter.status as CampaignStatus));
    }
    return items;
  }

  private toDto(doc: any): CampaignDto {
    const startsAt = new Date(doc.startsAt).toISOString();
    const endsAt = new Date(doc.endsAt).toISOString();
    return {
      id: String(doc._id),
      title: doc.title,
      protocols: doc.protocols,
      type: doc.type as CampaignType,
      description: doc.description,
      rewardSummary: doc.rewardSummary,
      startsAt,
      endsAt,
      url: doc.url,
      imageUrl: doc.imageUrl,
      chainId: doc.chainId,
      status: computeCampaignStatus(startsAt, endsAt),
      createdAt: new Date(doc.createdAt ?? Date.now()).toISOString(),
    };
  }
}
