import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './roles.enum';

interface JwtRequest extends Request {
  user: { sub: string; role: Role };
}

@Controller('role')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getRole(@Req() req: JwtRequest) {
    // Источник истины — БД (поле User.role)
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { role: true },
    });

    return { role: user?.role ?? req.user.role };
  }
}
