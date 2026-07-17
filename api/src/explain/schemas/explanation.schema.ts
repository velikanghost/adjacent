import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExplanationDocument = HydratedDocument<Explanation>;

/**
 * Cached plain-English explanation for a position, keyed by a hash of that
 * position's meaningful numbers. Auto-expires after 24h via a Mongo TTL index.
 */
@Schema({ collection: 'explanations' })
export class Explanation {
  @Prop({ required: true, unique: true, index: true })
  key: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  source: string;

  @Prop({ default: Date.now, expires: 86400 })
  createdAt: Date;
}

export const ExplanationSchema = SchemaFactory.createForClass(Explanation);
