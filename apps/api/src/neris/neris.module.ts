import { Module } from '@nestjs/common';
import { NerisGateway } from './neris.gateway';

@Module({
  providers: [NerisGateway],
  exports: [NerisGateway],
})
export class NerisModule {}
