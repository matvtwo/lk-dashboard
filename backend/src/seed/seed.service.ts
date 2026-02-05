import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@test.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) return;

    const hash = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'ADMIN',
        mustChangePassword: false,
        isActive: true,
        balance: 0,
      },
    });

    console.log(`[SEED] admin created: ${email} / ${password}`);
  }
}
