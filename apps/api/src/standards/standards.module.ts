import { Module } from '@nestjs/common';
import { StandardsController } from './standards.controller';
import { StandardsService } from './standards.service';

/** Server-delivered, per-department fireground timer standards. */
@Module({
  controllers: [StandardsController],
  providers: [StandardsService],
  exports: [StandardsService],
})
export class StandardsModule {}
