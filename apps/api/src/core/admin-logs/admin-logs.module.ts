import { Global, Module } from '@nestjs/common';
import { AdminLogsService } from './admin-logs.service';
import { AdminLogsController } from './admin-logs.controller';

@Global()
@Module({
  providers: [AdminLogsService],
  controllers: [AdminLogsController],
  exports: [AdminLogsService],
})
export class AdminLogsModule {}
