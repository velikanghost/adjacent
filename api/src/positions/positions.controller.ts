import { Controller, Get, Param } from '@nestjs/common';
import type { Address } from 'viem';
import type { Portfolio } from '@adjacent/shared';
import { PositionsService } from './positions.service';
import { ParseAddressPipe } from '../common/pipes/parse-address.pipe';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  /** GET /positions/:address — discover and value all positions for an address. */
  @Get(':address')
  getPortfolio(
    @Param('address', ParseAddressPipe) address: Address,
  ): Promise<Portfolio> {
    return this.positions.getPortfolio(address);
  }
}
