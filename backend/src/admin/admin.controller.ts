import { Body, Controller, Post, UseGuards, Req, Param, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import * as bcrypt from 'bcryptjs';

interface JwtRequest extends Request {
  user: { sub: string; role: Role };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('students')
  async createStudent(
    @Req() req: JwtRequest,
    @Body() body: { email: string },
  ) {
    const password = Math.random().toString(36).slice(-4);
    const hash = await bcrypt.hash(password, 10);

    const student = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hash,
        role: 'STUDENT',
        mustChangePassword: true,
      },
    });

    return {
      id: student.id,
      email: student.email,
      tempPassword: password,
    };
  }
  @Post('students/:id/reset-password')
async resetStudentPassword(@Req() req: JwtRequest, @Param('id') id: string) {
  const tempPassword = Math.random().toString(36).slice(-4);
  const hash = await bcrypt.hash(tempPassword, 10);

  await this.prisma.user.update({
    where: { id },
    data: {
      passwordHash: hash,
      mustChangePassword: true,
    },
  });

  return {
    ok: true,
    tempPassword,
  };
}
@Post('students/:id/change-email')
async changeStudentEmail(
  @Param('id') id: string,
  @Body() body: { email: string },
) {
  if (!body.email || !body.email.includes('@')) {
    throw new BadRequestException('Некорректный email');
  }

  await this.prisma.user.update({
    where: { id },
    data: {
      email: body.email,
    },
  });

  return { ok: true };
}

}
