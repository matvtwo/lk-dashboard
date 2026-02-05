import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule], // ← ВАЖНО
  controllers: [TeacherController],
})
export class TeacherModule {}
