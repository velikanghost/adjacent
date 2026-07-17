import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Explanation,
  type ExplanationDocument,
} from './schemas/explanation.schema';

/** Mongo-backed cache for generated explanations (TTL handled by the schema). */
@Injectable()
export class ExplanationCacheService {
  constructor(
    @InjectModel(Explanation.name)
    private readonly model: Model<ExplanationDocument>,
  ) {}

  async get(key: string): Promise<string | null> {
    const doc = await this.model.findOne({ key }).lean().exec();
    return doc?.text ?? null;
  }

  async set(key: string, text: string, source: string): Promise<void> {
    await this.model
      .updateOne(
        { key },
        { key, text, source, createdAt: new Date() },
        { upsert: true },
      )
      .exec();
  }
}
