import {
  Global,
  Module,
  OnModuleInit,
  OnModuleDestroy,
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from '@repo/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.withRetry(() => this.$connect());
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 500,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const isNetworkError =
        error instanceof Error &&
        (error.message.includes('EAI_AGAIN') ||
          error.message.includes('Can\'t reach database server') ||
          error.message.includes('Timed out'));

      if (isNetworkError && retries > 0) {
        console.warn(
          `Database operation failed (retrying ${retries} more times):`,
          error.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.withRetry(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }
