import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { PricingModule } from '../pricing/pricing.module';
import { ShmonadClient } from './shmonad/shmonad.client';
import { UniswapV3Client } from './uniswap/uniswap.client';
import { PROTOCOL_CLIENTS } from './protocol-clients.token';

/**
 * Registers every ProtocolClient and exposes them as a single injectable list.
 * Add a new protocol by providing its client and appending it to the factory.
 */
@Module({
  imports: [ChainModule, PricingModule],
  providers: [
    ShmonadClient,
    UniswapV3Client,
    {
      provide: PROTOCOL_CLIENTS,
      useFactory: (shmonad: ShmonadClient, uniswap: UniswapV3Client) => [
        shmonad,
        uniswap,
      ],
      inject: [ShmonadClient, UniswapV3Client],
    },
  ],
  exports: [PROTOCOL_CLIENTS],
})
export class ProtocolsModule {}
