import { Module } from '@nestjs/common';
import { NerisGateway } from './neris.gateway';
import { NerisController } from './neris.controller';

@Module({
  controllers: [NerisController],
  providers: [NerisGateway],
  exports: [NerisGateway],
})
export class NerisModule {}
