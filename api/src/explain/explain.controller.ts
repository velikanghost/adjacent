import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Position } from '@adjacent/shared';
import { ExplainService, type Explanation } from './explain.service';

@ApiTags('explain')
@Controller('explain')
export class ExplainController {
  constructor(private readonly explainService: ExplainService) {}

  @ApiOperation({
    summary:
      'Explain a position in plain English (Groq + deterministic template fallback, cached)',
  })
  @ApiBody({
    description: 'A Position object as returned by GET /positions/:address',
  })
  @Post()
  explain(@Body() position: Position): Promise<Explanation> {
    return this.explainService.explain(position);
  }
}
