import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { PricingService } from './pricing.service';

@Module({
  imports: [ChainModule],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
