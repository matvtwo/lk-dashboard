import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../auth/roles.enum';
import * as bcrypt from 'bcryptjs';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private prisma: PrismaService) {}

  // ===== GET /api/student/me =====
  @Get('me')
  async me(@Req() req: JwtRequest) {
    console.log('[STUDENT ME] hit');

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        mustChangePassword: true,
        groups: {
          include: {
            group: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    console.log('[STUDENT ME] db user =', user);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      balance: user.balance,
      mustChangePassword: user.mustChangePassword,
      group: user.groups[0]?.group ?? null,
    };
  }

  // ===== POST /api/student/change-password =====
  @Post('change-password')
  async changePassword(
    @Req() req: JwtRequest,
    @Body() body: { password: string },
  ) {
    console.log('[CHANGE PASSWORD] hit');

    const { password } = body;

    if (!password || password.length < 4) {
      throw new BadRequestException(
        'Пароль должен быть не короче 4 символов',
      );
    }

    const hash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: req.user.sub },
      data: {
        passwordHash: hash,
        mustChangePassword: false,
      },
    });

    console.log('[CHANGE PASSWORD] done');

    return { ok: true };
  }
}
