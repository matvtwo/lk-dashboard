import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { HealthController } from './health/health.controller';
import { AdminController } from './admin/admin.controller';
import { AuditModule } from './audit/audit.module';
import { StudentModule } from './student/student.module';
import { SeedModule } from './seed/seed.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [PrismaModule, AuthModule, GroupsModule, AuditModule,StudentModule,  SeedModule, TeacherModule,],
  controllers: [HealthController, AdminController],
})
export class AppModule {}
