import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Param,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Delete,
} from '@nestjs/common';

import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import * as bcrypt from 'bcryptjs';
import { CreateTeacherDto } from './dto/create-teacher.dto';

interface JwtRequest extends Request {
  user: { sub: string; role: Role };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private prisma: PrismaService) {}
  @Delete('students/:id')
  async deleteStudent(@Param('id') id: string) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!exists) {
      throw new NotFoundException('Student not found');
    }

    if (exists.role !== 'STUDENT') {
      throw new BadRequestException('Only students can be deleted here');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { ok: true };
  }
  @Post('teachers')
  async createTeacher(@Body() dto: CreateTeacherDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (exists) throw new ConflictException('Email already exists');

    const rawPassword = dto.password || 'Temporary123';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: passwordHash,
        role: Role.TEACHER,
        name: dto.name || null, // Маппим fullName из DTO в name из Prisma
        mustChangePassword: true, // Чтобы учитель сменил дефолтный пароль
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  }
  @Post('teachers/list')
  async listTeachers() {
    const teachers = await this.prisma.user.findMany({
      where: { role: Role.TEACHER },
      select: {
        id: true,
        email: true,
        name: true, // This will work after you update Prisma
      },
    });
    return teachers.map((t) => ({
      ...t,
      displayName: t.name || t.email.split('@')[0],
    }));
  }
  @Post('students')
  async createStudent(@Req() req: JwtRequest, @Body() body: { email: string }) {
    const password = Math.random().toString(36).slice(-4);
    const hash = await bcrypt.hash(password, 10);

    const student = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash: hash,
        role: Role.STUDENT,
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
