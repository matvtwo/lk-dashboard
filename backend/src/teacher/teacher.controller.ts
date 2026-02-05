import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { AuditService } from '../audit/audit.service';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('teacher')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class TeacherController {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  // 1️⃣ Мои группы
  @Get('groups')
  async myGroups(@Req() req: JwtRequest) {
    return this.prisma.group.findMany({
      where: {
        teacherId: req.user.sub,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 2️⃣ Конкретная группа + ученики
  @Get('groups/:id')
  async group(@Req() req: JwtRequest, @Param('id') id: string) {
    const group = await this.prisma.group.findFirst({
      where: {
        id,
        teacherId: req.user.sub,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                balance: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new ForbiddenException('Нет доступа к группе');
    }

    return group;
  }

  // 3️⃣ +10 / -10 очков
  @Post('points')
  async changePoints(
    @Req() req: JwtRequest,
    @Body() body: { userId: string; delta: number },
  ) {
    const { userId, delta } = body;

    if (![10, -10].includes(delta)) {
      throw new ForbiddenException('Недопустимое изменение баланса');
    }

    // проверяем, что ученик в группе преподавателя
    const member = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        group: {
          teacherId: req.user.sub,
        },
      },
      include: {
        user: true,
        group: true,
      },
    });

    if (!member) {
      throw new ForbiddenException('Ученик не из вашей группы');
    }

    // транзакция
await this.prisma.$transaction([
  this.prisma.user.update({
    where: { id: userId },
    data: { balance: { increment: delta } },
  }),
  this.prisma.transaction.create({
    data: {
      userId,
      delta,
      reason: `Teacher ${delta > 0 ? '+' : ''}${delta}`,
    },
  }),
]);

await this.audit.log({
  actorId: req.user.sub,
  action: 'TEACHER_POINTS',
  message: `Преподаватель изменил баланс ученика ${member.user.email} на ${delta}`,
});


    return { ok: true };
  }
}
