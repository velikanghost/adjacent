import { Module } from '@nestjs/common';
import { ProtocolsModule } from '../protocols/protocols.module';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

@Module({
  imports: [ProtocolsModule],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
