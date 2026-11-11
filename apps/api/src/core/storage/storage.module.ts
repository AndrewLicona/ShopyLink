import { Global, Module } from '@nestjs/common';
import { ImageOptimizerService } from './image-optimizer.service';
import { StorageService } from './storage.service';
import { UploadController } from './upload.controller';

@Global()
@Module({
  controllers: [UploadController],
  providers: [ImageOptimizerService, StorageService],
  exports: [ImageOptimizerService, StorageService],
})
export class StorageModule {}
