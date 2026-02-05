import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class GroupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  create(ownerId: string, name: string) {
    return this.prisma.group.create({
      data: {
        name,
        ownerId,
      },
    });
  }

  list(ownerId: string) {
    return this.prisma.group.findMany({
      where: { ownerId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  studentsWithoutGroup(ownerId: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
        groups: { none: {} },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addStudent(groupId: string, userId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    return this.prisma.groupMember.create({
      data: { groupId, userId },
    });
  }

  async removeStudent(groupId: string, userId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group || group.ownerId !== ownerId) {
      throw new ForbiddenException();
    }

    return this.prisma.groupMember.delete({
      where: {
        groupId_userId: { groupId, userId },
      },
    });
  }

async moveStudent(
  fromGroupId: string,
  toGroupId: string,
  userId: string,
  ownerId: string,
) {
  // 1. Загружаем данные ДЛЯ ЛОГА
  const student = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const fromGroup = await this.prisma.group.findUnique({
    where: { id: fromGroupId },
    select: { name: true },
  });

  const toGroup = await this.prisma.group.findUnique({
    where: { id: toGroupId },
    select: { name: true },
  });

  if (!student || !fromGroup || !toGroup) {
    throw new Error('Некорректные данные для переноса');
  }

  // 2. Сама бизнес-операция
  await this.prisma.groupMember.deleteMany({
    where: {
      groupId: fromGroupId,
      userId,
    },
  });

  await this.prisma.groupMember.create({
    data: {
      groupId: toGroupId,
      userId,
    },
  });

  // 3. ЧЕЛОВЕЧЕСКИЙ ЛОГ
  await this.audit.log({
    actorId: ownerId,
    action: 'STUDENT_MOVE',
    message: `Ученик ${student.email} перенесён из группы "${fromGroup.name}" в группу "${toGroup.name}"`,
  });

  return { ok: true };
}

}
