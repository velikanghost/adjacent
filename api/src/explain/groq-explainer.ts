import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { Position } from '@adjacent/shared';
import { positionFacts } from './position-facts';

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are adjacent, a friendly DeFi copilot. Explain the user's position in 2-3 short, plain-English sentences a beginner can understand.

Rules:
- Use ONLY the figures given in the position data. Never invent, recompute, or add any numbers.
- No markdown, no bullet points, no headings — just a short paragraph.
- Explain any jargon (impermanent loss, in-range, liquid staking) in passing.
- Be reassuring but honest about risk.`;

/**
 * LLM-enhanced explainer via Groq's free tier. It only *phrases* the numbers we
 * already computed (enforced by the system prompt + the facts payload). Throws
 * on any failure so the service can fall back to the deterministic template.
 */
@Injectable()
export class GroqExplainer {
  private readonly logger = new Logger(GroqExplainer.name);
  private readonly client: Groq | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GROQ_API_KEY');
    this.client = apiKey ? new Groq({ apiKey }) : null;
    this.model = config.get<string>('GROQ_MODEL') ?? DEFAULT_MODEL;
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async explain(position: Position): Promise<string> {
    if (!this.client) throw new Error('Groq is not configured');

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: positionFacts(position) },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('Empty Groq response');
    return text;
  }
}
