import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
        teacher: { select: { id: true, email: true } }, // ← ДОБАВИЛИ
        members: {
          where: {
            user: {
              role: 'STUDENT',
            },
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                balance: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async teachers(ownerId: string) {
    // ownerId можно использовать для аудита/ограничений; пока просто оставляем сигнатуру
    return this.prisma.user.findMany({
      where: { role: 'TEACHER', isActive: true },
      select: { id: true, email: true },
      orderBy: { email: 'asc' },
    });
  }

  async setTeacher(groupId: string, teacherId: string | null, ownerId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, ownerId: true, name: true },
    });
    if (!group) throw new NotFoundException('Группа не найдена');
    if (group.ownerId !== ownerId)
      throw new ForbiddenException('Нет доступа к группе');

    if (teacherId) {
      const teacher = await this.prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, role: true },
      });
      if (!teacher) throw new BadRequestException('teacherId не найден');
      if (teacher.role !== 'TEACHER')
        throw new BadRequestException('Пользователь не является TEACHER');
    }

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: { teacherId },
      include: { teacher: { select: { id: true, email: true } } },
    });

    await this.audit.log({
      actorId: ownerId,
      action: 'GROUP_SET_TEACHER',
      message: `Назначен преподаватель для группы "${group.name}"`,
    });

    return updated;
  }

  studentsWithoutGroup(ownerId: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        groups: { none: {} },
      },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addStudent(groupId: string, userId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group || group.ownerId !== ownerId) {
      throw new ForbiddenException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.role !== 'STUDENT')
      throw new BadRequestException('Можно добавлять только студентов');
    try {
      return await this.prisma.groupMember.create({
        data: { groupId, userId },
      });
    } catch (e: any) {
      // Prisma P2002 — unique constraint
      if (e?.code === 'P2002')
        throw new BadRequestException('Ученик уже в группе');
      throw e;
    }
  }

  async removeStudent(groupId: string, userId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
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
  async deleteGroup(groupId: string, ownerId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, ownerId: true, name: true },
    });

    if (!group) {
      throw new NotFoundException('Группа не найдена');
    }

    if (group.ownerId !== ownerId) {
      throw new ForbiddenException('Нет доступа к группе');
    }

    await this.prisma.group.delete({
      where: { id: groupId },
    });

    await this.audit.log({
      actorId: ownerId,
      action: 'GROUP_DELETE',
      message: `Удалена группа "${group.name}"`,
    });

    return { ok: true };
  }
}
