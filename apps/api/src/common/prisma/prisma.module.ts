import { Global, Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useClass: PrismaClient,
    },
    {
      provide: 'PRISMA_CLIENT',
      useExisting: PrismaClient,
    },
  ],
  exports: [PrismaClient, 'PRISMA_CLIENT'],
})
export class PrismaModule
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
