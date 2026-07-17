import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExplainController } from './explain.controller';
import { ExplainService } from './explain.service';
import { TemplateExplainer } from './template-explainer';
import { GroqExplainer } from './groq-explainer';
import { ExplanationCacheService } from './explanation-cache.service';
import { Explanation, ExplanationSchema } from './schemas/explanation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Explanation.name, schema: ExplanationSchema },
    ]),
  ],
  controllers: [ExplainController],
  providers: [
    ExplainService,
    TemplateExplainer,
    GroqExplainer,
    ExplanationCacheService,
  ],
})
export class ExplainModule {}
