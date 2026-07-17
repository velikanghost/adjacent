import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Address } from 'viem';
import type { Portfolio } from '@adjacent/shared';
import { PositionsService } from './positions.service';
import { ParseAddressPipe } from '../common/pipes/parse-address.pipe';

@ApiTags('positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  /** GET /positions/:address — discover and value all positions for an address. */
  @ApiOperation({
    summary: 'Discover and value all DeFi positions for an address',
  })
  @ApiParam({
    name: 'address',
    description: 'EVM address (0x + 40 hex chars)',
    example: '0xcbF323be43eF0f3A92eCBC0980f427cBa45f0866',
  })
  @ApiOkResponse({
    description:
      'The discovered, valued portfolio in the unified Position model.',
  })
  @Get(':address')
  getPortfolio(
    @Param('address', ParseAddressPipe) address: Address,
  ): Promise<Portfolio> {
    return this.positions.getPortfolio(address);
  }
}
