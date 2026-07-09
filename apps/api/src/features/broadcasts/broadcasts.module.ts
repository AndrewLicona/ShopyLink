import { Module } from '@nestjs/common';
import { BroadcastsService } from './broadcasts.service';
import { BroadcastsController } from './broadcasts.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BroadcastsService],
  controllers: [BroadcastsController],
  exports: [BroadcastsService],
})
export class BroadcastsModule {}
