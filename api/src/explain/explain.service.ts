import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import type { Position } from '@adjacent/shared';
import { ExplanationCacheService } from './explanation-cache.service';
import { TemplateExplainer } from './template-explainer';
import { GroqExplainer } from './groq-explainer';

export interface Explanation {
  text: string;
  source: 'cache' | 'groq' | 'template';
}

/**
 * Produces a position explanation: cache → Groq (if configured) → template
 * fallback. Numbers are always computed upstream; the model only phrases them.
 */
@Injectable()
export class ExplainService {
  private readonly logger = new Logger(ExplainService.name);

  constructor(
    private readonly cache: ExplanationCacheService,
    private readonly template: TemplateExplainer,
    private readonly groq: GroqExplainer,
  ) {}

  async explain(position: Position): Promise<Explanation> {
    if (!position?.id || !position?.protocol || !position?.type) {
      throw new BadRequestException('A valid position is required');
    }

    const key = hashPosition(position);

    const cached = await this.cache.get(key).catch(() => null);
    if (cached) return { text: cached, source: 'cache' };

    const { text, source } = await this.generate(position);

    await this.cache
      .set(key, text, source)
      .catch((error) =>
        this.logger.warn(`Explanation cache write failed: ${(error as Error).message}`),
      );

    return { text, source };
  }

  private async generate(
    position: Position,
  ): Promise<{ text: string; source: 'groq' | 'template' }> {
    if (this.groq.enabled) {
      try {
        return { text: await this.groq.explain(position), source: 'groq' };
      } catch (error) {
        this.logger.warn(
          `Groq explanation failed, using template: ${(error as Error).message}`,
        );
      }
    }
    return { text: this.template.explain(position), source: 'template' };
  }
}

/** Stable cache key from a position's meaningful, display-affecting numbers. */
function hashPosition(position: Position): string {
  const basis = JSON.stringify({
    id: position.id,
    value: position.valueUSD !== null ? Math.round(position.valueUSD * 100) : null,
    risk: position.risk.level,
    metrics: position.metrics,
  });
  return createHash('sha256').update(basis).digest('hex');
}
