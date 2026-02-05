import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['info', 'warn', 'error'],
    });

    // ⚠️ Prisma 6 typing workaround (официально рекомендуемый)
    (this as any).$on('query', (e: any) => {
      console.log(
        `[DB] ${e.duration}ms\n${e.query}\nparams=${e.params}\n`,
      );
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('[DB] connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[DB] disconnected');
  }
}
