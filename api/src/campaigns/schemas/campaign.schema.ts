import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ collection: 'campaigns', timestamps: true })
export class Campaign {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [String], required: true })
  protocols: string[];

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  rewardSummary: string;

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop({ required: true })
  url: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true })
  chainId: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
